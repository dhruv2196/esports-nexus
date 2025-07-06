const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation schemas
const createPayoutSchema = Joi.object({
  amount: Joi.number().integer().min(100).required(), // Minimum $1
  currency: Joi.string().length(3).default('USD'),
  tournament_id: Joi.string().uuid(),
  description: Joi.string().max(500),
  payout_method: Joi.string().valid('bank_account', 'card', 'paypal', 'crypto').default('bank_account')
});

const connectAccountSchema = Joi.object({
  country: Joi.string().length(2).required(),
  business_type: Joi.string().valid('individual', 'company').default('individual'),
  email: Joi.string().email().required()
});

// Create Stripe Connect account
router.post('/connect-account', async (req, res, next) => {
  try {
    const { error, value } = connectAccountSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { db } = req.app.locals;
    const userId = req.user.id;

    // Check if user already has connect account
    const wallet = await db.query(
      'SELECT stripe_connect_account_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length > 0 && wallet.rows[0].stripe_connect_account_id) {
      return res.status(400).json({ error: 'Connect account already exists' });
    }

    // Create Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: value.country,
      email: value.email,
      business_type: value.business_type,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: {
        user_id: userId
      }
    });

    // Save to database
    await db.query(
      `INSERT INTO user_wallets (user_id, stripe_connect_account_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET stripe_connect_account_id = $2`,
      [userId, account.id]
    );

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/settings/payouts`,
      return_url: `${process.env.FRONTEND_URL}/settings/payouts/success`,
      type: 'account_onboarding'
    });

    res.json({
      account_id: account.id,
      onboarding_url: accountLink.url
    });

  } catch (error) {
    next(error);
  }
});

// Get payout account status
router.get('/account-status', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const wallet = await db.query(
      'SELECT stripe_connect_account_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0 || !wallet.rows[0].stripe_connect_account_id) {
      return res.json({ status: 'not_connected' });
    }

    const account = await stripe.accounts.retrieve(
      wallet.rows[0].stripe_connect_account_id
    );

    res.json({
      status: account.charges_enabled ? 'active' : 'pending',
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      country: account.country,
      default_currency: account.default_currency
    });

  } catch (error) {
    next(error);
  }
});

// Request payout
router.post('/request', async (req, res, next) => {
  try {
    const { error, value } = createPayoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { db, logger } = req.app.locals;
    const userId = req.user.id;

    // Check user balance
    const wallet = await db.query(
      'SELECT balance_cents, stripe_connect_account_id FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.rows[0].balance_cents < value.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Verify tournament winnings if tournament_id provided
    if (value.tournament_id) {
      try {
        const tournamentResponse = await axios.get(
          `${process.env.TOURNAMENT_SERVICE_URL}/api/v1/tournaments/${value.tournament_id}`,
          { headers: { 'X-User-ID': userId } }
        );
        
        // Verify user is a winner
        // This is simplified - in production, verify actual winnings
      } catch (err) {
        logger.error('Failed to verify tournament:', err);
      }
    }

    const payoutId = uuidv4();
    let stripePayout = null;

    // Process payout based on method
    if (value.payout_method === 'bank_account' && wallet.rows[0].stripe_connect_account_id) {
      // Create Stripe payout
      try {
        stripePayout = await stripe.payouts.create({
          amount: value.amount,
          currency: value.currency.toLowerCase(),
          description: value.description,
          metadata: {
            user_id: userId,
            payout_id: payoutId,
            tournament_id: value.tournament_id
          }
        }, {
          stripeAccount: wallet.rows[0].stripe_connect_account_id
        });
      } catch (stripeError) {
        logger.error('Stripe payout error:', stripeError);
        return res.status(400).json({ 
          error: 'Payout failed', 
          details: stripeError.message 
        });
      }
    }

    // Begin transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Create payout record
      await client.query(
        `INSERT INTO payouts (id, user_id, tournament_id, amount_cents, currency, 
         status, payout_method, stripe_payout_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          payoutId,
          userId,
          value.tournament_id,
          value.amount,
          value.currency,
          stripePayout ? 'processing' : 'pending',
          value.payout_method,
          stripePayout?.id,
          JSON.stringify({ description: value.description })
        ]
      );

      // Update wallet balance
      await client.query(
        `UPDATE user_wallets 
         SET balance_cents = balance_cents - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [value.amount, userId]
      );

      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, type, amount_cents, balance_after_cents, 
         description, reference_id, reference_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'payout',
          -value.amount,
          wallet.rows[0].balance_cents - value.amount,
          value.description || 'Payout request',
          payoutId,
          'payout'
        ]
      );

      await client.query('COMMIT');

      res.json({
        payout_id: payoutId,
        amount: value.amount,
        currency: value.currency,
        status: stripePayout ? 'processing' : 'pending',
        estimated_arrival: stripePayout?.arrival_date ? 
          new Date(stripePayout.arrival_date * 1000) : 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    next(error);
  }
});

// Get payout history
router.get('/history', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;

    let query = `
      SELECT id, tournament_id, amount_cents, currency, status, 
             payout_method, processed_at, created_at
      FROM payouts
      WHERE user_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const payouts = await db.query(query, params);

    const total = await db.query(
      'SELECT COUNT(*) FROM payouts WHERE user_id = $1' + (status ? ' AND status = $2' : ''),
      status ? [userId, status] : [userId]
    );

    res.json({
      payouts: payouts.rows,
      total: parseInt(total.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    next(error);
  }
});

// Get payout details
router.get('/:id', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { id } = req.params;

    const payout = await db.query(
      `SELECT * FROM payouts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (payout.rows.length === 0) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    res.json({ payout: payout.rows[0] });

  } catch (error) {
    next(error);
  }
});

// Cancel payout (if still pending)
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { id } = req.params;

    // Get payout
    const payout = await db.query(
      'SELECT * FROM payouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (payout.rows.length === 0) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (payout.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending payouts' });
    }

    // Begin transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Update payout status
      await client.query(
        'UPDATE payouts SET status = $1 WHERE id = $2',
        ['canceled', id]
      );

      // Refund balance
      await client.query(
        'UPDATE user_wallets SET balance_cents = balance_cents + $1 WHERE user_id = $2',
        [payout.rows[0].amount_cents, userId]
      );

      // Get updated balance
      const wallet = await client.query(
        'SELECT balance_cents FROM user_wallets WHERE user_id = $1',
        [userId]
      );

      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (user_id, type, amount_cents, balance_after_cents, 
         description, reference_id, reference_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'payout_canceled',
          payout.rows[0].amount_cents,
          wallet.rows[0].balance_cents,
          'Payout canceled',
          id,
          'payout'
        ]
      );

      await client.query('COMMIT');

      res.json({
        payout_id: id,
        status: 'canceled',
        refunded_amount: payout.rows[0].amount_cents
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    next(error);
  }
});

// Get wallet balance
router.get('/wallet/balance', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;

    const wallet = await db.query(
      'SELECT balance_cents, currency FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    if (wallet.rows.length === 0) {
      // Create wallet if doesn't exist
      await db.query(
        'INSERT INTO user_wallets (user_id) VALUES ($1)',
        [userId]
      );
      
      return res.json({
        balance: 0,
        currency: 'USD'
      });
    }

    res.json({
      balance: wallet.rows[0].balance_cents,
      currency: wallet.rows[0].currency || 'USD'
    });

  } catch (error) {
    next(error);
  }
});

// Get wallet transactions
router.get('/wallet/transactions', async (req, res, next) => {
  try {
    const { db } = req.app.locals;
    const userId = req.user.id;
    const { limit = 20, offset = 0, type } = req.query;

    let query = `
      SELECT id, type, amount_cents, balance_after_cents, 
             description, reference_id, reference_type, created_at
      FROM wallet_transactions
      WHERE user_id = $1
    `;
    const params = [userId];

    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const transactions = await db.query(query, params);

    res.json({
      transactions: transactions.rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;