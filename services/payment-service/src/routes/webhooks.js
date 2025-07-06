const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { db, logger } = req.app.locals;

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, db, logger);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, db, logger);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, db, logger);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, db, logger);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, db, logger);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, db, logger);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, db, logger);
        break;
        
      case 'payout.paid':
        await handlePayoutPaid(event.data.object, db, logger);
        break;
        
      case 'payout.failed':
        await handlePayoutFailed(event.data.object, db, logger);
        break;
        
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).send('Webhook processing error');
  }

  res.json({ received: true });
});

// Handler functions
async function handlePaymentIntentSucceeded(paymentIntent, db, logger) {
  logger.info('Payment succeeded:', paymentIntent.id);
  
  // Update payment status
  await db.query(
    `UPDATE payments 
     SET status = 'succeeded', payment_method = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE stripe_payment_intent_id = $2`,
    [paymentIntent.payment_method, paymentIntent.id]
  );
  
  // If this is a tournament entry fee, update wallet
  if (paymentIntent.metadata.tournament_id) {
    const userId = paymentIntent.metadata.user_id;
    const amount = paymentIntent.amount;
    
    // Add to wallet
    await db.query(
      `UPDATE user_wallets 
       SET balance_cents = balance_cents + $1 
       WHERE user_id = $2`,
      [amount, userId]
    );
    
    // Record transaction
    await db.query(
      `INSERT INTO wallet_transactions (user_id, type, amount_cents, balance_after_cents, 
       description, reference_id, reference_type)
       SELECT $1, 'deposit', $2, balance_cents, $3, $4, 'payment'
       FROM user_wallets WHERE user_id = $1`,
      [userId, amount, 'Tournament entry deposit', paymentIntent.id]
    );
  }
}

async function handlePaymentIntentFailed(paymentIntent, db, logger) {
  logger.info('Payment failed:', paymentIntent.id);
  
  await db.query(
    `UPDATE payments 
     SET status = 'failed', updated_at = CURRENT_TIMESTAMP 
     WHERE stripe_payment_intent_id = $1`,
    [paymentIntent.id]
  );
}

async function handleSubscriptionCreated(subscription, db, logger) {
  logger.info('Subscription created:', subscription.id);
  
  // This is handled in the create subscription endpoint
  // This webhook serves as a backup
}

async function handleSubscriptionUpdated(subscription, db, logger) {
  logger.info('Subscription updated:', subscription.id);
  
  await db.query(
    `UPDATE subscriptions 
     SET status = $1, current_period_start = $2, current_period_end = $3, 
         cancel_at_period_end = $4, updated_at = CURRENT_TIMESTAMP 
     WHERE stripe_subscription_id = $5`,
    [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id
    ]
  );
}

async function handleSubscriptionDeleted(subscription, db, logger) {
  logger.info('Subscription deleted:', subscription.id);
  
  await db.query(
    `UPDATE subscriptions 
     SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );
}

async function handleInvoicePaymentSucceeded(invoice, db, logger) {
  logger.info('Invoice payment succeeded:', invoice.id);
  
  // Record subscription payment
  if (invoice.subscription) {
    const payment = await db.query(
      `INSERT INTO payments (user_id, amount_cents, currency, status, 
       payment_method, description, metadata)
       SELECT user_id, $1, $2, 'succeeded', 'subscription', $3, $4
       FROM subscriptions WHERE stripe_subscription_id = $5
       RETURNING id`,
      [
        invoice.amount_paid,
        invoice.currency.toUpperCase(),
        'Subscription payment',
        JSON.stringify({ invoice_id: invoice.id }),
        invoice.subscription
      ]
    );
    
    if (payment.rows.length > 0) {
      logger.info('Recorded subscription payment:', payment.rows[0].id);
    }
  }
}

async function handleInvoicePaymentFailed(invoice, db, logger) {
  logger.info('Invoice payment failed:', invoice.id);
  
  // You might want to notify the user or take other actions
  // For now, just log it
}

async function handlePayoutPaid(payout, db, logger) {
  logger.info('Payout paid:', payout.id);
  
  await db.query(
    `UPDATE payouts 
     SET status = 'paid', processed_at = CURRENT_TIMESTAMP 
     WHERE stripe_payout_id = $1`,
    [payout.id]
  );
}

async function handlePayoutFailed(payout, db, logger) {
  logger.info('Payout failed:', payout.id);
  
  const payoutRecord = await db.query(
    'SELECT * FROM payouts WHERE stripe_payout_id = $1',
    [payout.id]
  );
  
  if (payoutRecord.rows.length > 0) {
    const payoutData = payoutRecord.rows[0];
    
    // Begin transaction to refund the amount
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Update payout status
      await client.query(
        `UPDATE payouts 
         SET status = 'failed', processed_at = CURRENT_TIMESTAMP 
         WHERE stripe_payout_id = $1`,
        [payout.id]
      );
      
      // Refund to wallet
      await client.query(
        `UPDATE user_wallets 
         SET balance_cents = balance_cents + $1 
         WHERE user_id = $2`,
        [payoutData.amount_cents, payoutData.user_id]
      );
      
      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, type, amount_cents, balance_after_cents, 
         description, reference_id, reference_type)
         SELECT $1, 'payout_failed', $2, balance_cents, $3, $4, 'payout'
         FROM user_wallets WHERE user_id = $1`,
        [
          payoutData.user_id,
          payoutData.amount_cents,
          'Payout failed - amount refunded',
          payoutData.id
        ]
      );
      
      await client.query('COMMIT');
      logger.info('Refunded failed payout amount to user wallet');
      
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Error refunding failed payout:', err);
    } finally {
      client.release();
    }
  }
}

module.exports = router;