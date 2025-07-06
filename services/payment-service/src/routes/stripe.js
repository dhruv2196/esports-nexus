const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation schemas
const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().integer().min(50).required(), // Minimum 50 cents
  currency: Joi.string().length(3).default('USD'),
  description: Joi.string().max(500),
  metadata: Joi.object(),
  payment_method_types: Joi.array().items(Joi.string()).default(['card'])
});

const confirmPaymentSchema = Joi.object({
  payment_intent_id: Joi.string().required(),
  payment_method: Joi.string().required()
});

// Create payment intent
router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { error, value } = createPaymentIntentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { db, redis } = req.app.locals;
    const userId = req.user.id;

    // Get or create Stripe customer
    let stripeCustomerId;
    const wallet = await db.query(
      'SELECT stripe_customer_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0 || !wallet.rows[0].stripe_customer_id) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        metadata: { user_id: userId }
      });
      stripeCustomerId = customer.id;

      // Save to database
      await db.query(
        `INSERT INTO user_wallets (user_id, stripe_customer_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id) 
         DO UPDATE SET stripe_customer_id = $2`,
        [userId, stripeCustomerId]
      );
    } else {
      stripeCustomerId = wallet.rows[0].stripe_customer_id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: value.amount,
      currency: value.currency.toLowerCase(),
      customer: stripeCustomerId,
      description: value.description,
      metadata: {
        ...value.metadata,
        user_id: userId
      },
      payment_method_types: value.payment_method_types
    });

    // Store payment record
    const paymentId = uuidv4();
    await db.query(
      `INSERT INTO payments (id, user_id, amount_cents, currency, status, stripe_payment_intent_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        paymentId,
        userId,
        value.amount,
        value.currency,
        'pending',
        paymentIntent.id,
        value.description,
        JSON.stringify(value.metadata)
      ]
    );

    res.json({
      payment_id: paymentId,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    next(error);
  }
});

// Confirm payment
router.post('/confirm-payment', async (req, res, next) => {
  try {
    const { error, value } = confirmPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Verify payment belongs to user
    const payment = await db.query(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = $1 AND user_id = $2',
      [value.payment_intent_id, userId]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Confirm payment with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(
      value.payment_intent_id,
      {
        payment_method: value.payment_method
      }
    );

    // Update payment status
    await db.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
      [paymentIntent.status, value.payment_intent_id]
    );

    res.json({
      status: paymentIntent.status,
      payment_id: payment.rows[0].id
    });

  } catch (error) {
    next(error);
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get Stripe customer ID
    const wallet = await db.query(
      'SELECT stripe_customer_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0 || !wallet.rows[0].stripe_customer_id) {
      return res.json({ payment_methods: [] });
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: wallet.rows[0].stripe_customer_id,
      type: 'card'
    });

    res.json({
      payment_methods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year
      }))
    });

  } catch (error) {
    next(error);
  }
});

// Add payment method
router.post('/payment-methods', async (req, res, next) => {
  try {
    const { payment_method_id } = req.body;
    if (!payment_method_id) {
      return res.status(400).json({ error: 'Payment method ID required' });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get or create Stripe customer
    let stripeCustomerId;
    const wallet = await db.query(
      'SELECT stripe_customer_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0 || !wallet.rows[0].stripe_customer_id) {
      const customer = await stripe.customers.create({
        metadata: { user_id: userId }
      });
      stripeCustomerId = customer.id;

      await db.query(
        `INSERT INTO user_wallets (user_id, stripe_customer_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id) 
         DO UPDATE SET stripe_customer_id = $2`,
        [userId, stripeCustomerId]
      );
    } else {
      stripeCustomerId = wallet.rows[0].stripe_customer_id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: stripeCustomerId
    });

    res.json({ success: true });

  } catch (error) {
    next(error);
  }
});

// Delete payment method
router.delete('/payment-methods/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { db } = req.app.locals;
    const userId = req.user.id;

    // Verify ownership
    const wallet = await db.query(
      'SELECT stripe_customer_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Detach payment method
    await stripe.paymentMethods.detach(id);

    res.json({ success: true });

  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const payments = await db.query(
      `SELECT id, amount_cents, currency, status, description, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const total = await db.query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [userId]
    );

    res.json({
      payments: payments.rows,
      total: parseInt(total.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    next(error);
  }
});

// Refund payment
router.post('/refund', async (req, res, next) => {
  try {
    const { payment_id, amount, reason } = req.body;
    
    if (!payment_id) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get payment
    const payment = await db.query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [payment_id, userId]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.rows[0].status !== 'succeeded') {
      return res.status(400).json({ error: 'Can only refund succeeded payments' });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.rows[0].stripe_payment_intent_id,
      amount: amount || payment.rows[0].amount_cents,
      reason: reason || 'requested_by_customer'
    });

    // Update payment status
    await db.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['refunded', payment_id]
    );

    res.json({
      refund_id: refund.id,
      amount: refund.amount,
      status: refund.status
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;