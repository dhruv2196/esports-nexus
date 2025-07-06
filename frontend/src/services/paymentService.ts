import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  clientSecret: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: Date;
  metadata?: any;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  pricePerMonth: number;
  features: string[];
}

export interface PayoutRequest {
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'crypto';
  destination: string;
  description: string;
}

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export const paymentService = {
  // Payment methods
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Promise<PaymentIntent> {
    const response = await api.post(API_ENDPOINTS.payments.createPaymentIntent, {
      amount,
      currency,
      metadata
    });
    return response.data;
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<Payment> {
    const response = await api.post(API_ENDPOINTS.payments.confirmPayment, {
      paymentIntentId,
      paymentMethodId
    });
    return response.data;
  },

  async getPaymentHistory(limit: number = 10, offset: number = 0): Promise<Payment[]> {
    const response = await api.get(API_ENDPOINTS.payments.history, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    const response = await api.get(API_ENDPOINTS.payments.subscriptions.list);
    return response.data;
  },

  async createSubscription(planId: string, paymentMethodId: string): Promise<Subscription> {
    const response = await api.post(API_ENDPOINTS.payments.subscriptions.create, {
      planId,
      paymentMethodId
    });
    return response.data;
  },

  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<void> {
    await api.post(API_ENDPOINTS.payments.subscriptions.cancel(subscriptionId), {
      immediate
    });
  },

  // Payout methods
  async requestPayout(data: PayoutRequest): Promise<Payout> {
    const response = await api.post(API_ENDPOINTS.payments.payouts.request, data);
    return response.data;
  },

  async getPayouts(status?: string): Promise<Payout[]> {
    const response = await api.get(API_ENDPOINTS.payments.payouts.list, {
      params: status ? { status } : undefined
    });
    return response.data;
  },

  async getPayoutStatus(payoutId: string): Promise<Payout> {
    const response = await api.get(API_ENDPOINTS.payments.payouts.status(payoutId));
    return response.data;
  },

  // Helper methods for Stripe integration
  stripe: {
    async getPublishableKey(): Promise<string> {
      const response = await api.get('/api/v1/payments/stripe/config');
      return response.data.publishableKey;
    },

    formatAmount(amount: number, currency: string = 'usd'): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100); // Stripe uses cents
    }
  }
};