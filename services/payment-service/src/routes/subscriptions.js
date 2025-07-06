const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription plans
const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price_id: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    features: ['Basic stats', 'Tournament participation', '5 team slots']
  },
  pro: {
    name: 'Pro Plan',
    price_id: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    features: ['Advanced stats', 'Priority matchmaking', '20 team slots', 'AI coaching']
  },
  premium: {
    name: 'Premium Plan',
    price_id: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: ['All features', 'Unlimited teams', 'Custom tournaments', 'API access']
  }
};

// Validation schemas
const createSubscriptionSchema = Joi.object({
  plan_id: Joi.string().valid('basic', 'pro', 'premium').required(),
  payment_method_id: Joi.string().required()
});

// Get available plans
router.get('/plans', (req, res) => {
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
    id,
    name: plan.name,
    features: plan.features
  }));
  
  res.json({ plans });
});

// Create subscription
router.post('/create', async (req, res, next) => {
  try {
    const { error, value } = createSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Check if user already has active subscription
    const existingSub = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (existingSub.rows.length > 0) {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

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

    // Attach payment method
    await stripe.paymentMethods.attach(value.payment_method_id, {
      customer: stripeCustomerId
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: value.payment_method_id
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: SUBSCRIPTION_PLANS[value.plan_id].price_id }],
      expand: ['latest_invoice.payment_intent']
    });

    // Store subscription in database
    const subscriptionId = uuidv4();
    await db.query(
      `INSERT INTO subscriptions (id, user_id, stripe_subscription_id, plan_id, status, 
       current_period_start, current_period_end, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        subscriptionId,
        userId,
        subscription.id,
        value.plan_id,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        JSON.stringify({ stripe_data: subscription })
      ]
    );

    res.json({
      subscription_id: subscriptionId,
      status: subscription.status,
      plan_id: value.plan_id,
      current_period_end: subscription.current_period_end
    });

  } catch (error) {
    next(error);
  }
});

// Get current subscription
router.get('/current', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const subscription = await db.query(
      `SELECT id, plan_id, status, current_period_start, current_period_end, 
       cancel_at_period_end, created_at
       FROM subscriptions 
       WHERE user_id = $1 AND status IN ('active', 'trialing')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (subscription.rows.length === 0) {
      return res.json({ subscription: null });
    }

    const sub = subscription.rows[0];
    res.json({
      subscription: {
        ...sub,
        plan: SUBSCRIPTION_PLANS[sub.plan_id]
      }
    });

  } catch (error) {
    next(error);
  }
});

// Update subscription
router.put('/update', async (req, res, next) => {
  try {
    const { plan_id } = req.body;
    
    if (!plan_id || !SUBSCRIPTION_PLANS[plan_id]) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get current subscription
    const currentSub = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (currentSub.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const stripeSubId = currentSub.rows[0].stripe_subscription_id;

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubId);
    const updatedSubscription = await stripe.subscriptions.update(stripeSubId, {
      items: [{
        id: subscription.items.data[0].id,
        price: SUBSCRIPTION_PLANS[plan_id].price_id
      }],
      proration_behavior: 'create_prorations'
    });

    // Update in database
    await db.query(
      `UPDATE subscriptions 
       SET plan_id = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [plan_id, currentSub.rows[0].id]
    );

    res.json({
      subscription_id: currentSub.rows[0].id,
      plan_id: plan_id,
      status: updatedSubscription.status
    });

  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', async (req, res, next) => {
  try {
    const { immediate = false } = req.body;
    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get current subscription
    const currentSub = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (currentSub.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const stripeSubId = currentSub.rows[0].stripe_subscription_id;

    // Cancel in Stripe
    let canceledSubscription;
    if (immediate) {
      canceledSubscription = await stripe.subscriptions.del(stripeSubId);
    } else {
      canceledSubscription = await stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true
      });
    }

    // Update in database
    await db.query(
      `UPDATE subscriptions 
       SET status = $1, cancel_at_period_end = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [
        immediate ? 'canceled' : 'active',
        !immediate,
        currentSub.rows[0].id
      ]
    );

    res.json({
      subscription_id: currentSub.rows[0].id,
      status: canceledSubscription.status,
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      canceled_at: canceledSubscription.canceled_at
    });

  } catch (error) {
    next(error);
  }
});

// Reactivate subscription
router.post('/reactivate', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    // Get subscription scheduled for cancellation
    const currentSub = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 AND cancel_at_period_end = true',
      [userId, 'active']
    );

    if (currentSub.rows.length === 0) {
      return res.status(404).json({ error: 'No subscription scheduled for cancellation' });
    }

    const stripeSubId = currentSub.rows[0].stripe_subscription_id;

    // Reactivate in Stripe
    const subscription = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: false
    });

    // Update in database
    await db.query(
      `UPDATE subscriptions 
       SET cancel_at_period_end = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [currentSub.rows[0].id]
    );

    res.json({
      subscription_id: currentSub.rows[0].id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end
    });

  } catch (error) {
    next(error);
  }
});

// Get subscription history
router.get('/history', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const subscriptions = await db.query(
      `SELECT id, plan_id, status, current_period_start, current_period_end, 
       cancel_at_period_end, created_at
       FROM subscriptions 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      subscriptions: subscriptions.rows.map(sub => ({
        ...sub,
        plan: SUBSCRIPTION_PLANS[sub.plan_id]
      }))
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;