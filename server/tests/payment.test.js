import request from 'supertest';
import app from '../server.js';
import crypto from 'crypto';
import config from '../config/index.js';
import Order from '../models/Order.js';

describe('Payment Verification API', () => {
  it('should verify correct razorpay signature', async () => {
    // 1. Mock order in DB
    const mockOrder = await Order.create({
      farmerId: '654321098765432109876543',
      shopId: '654321098765432109876543',
      items: [],
      pricing: { subtotal: 100, deliveryFee: 0, tax: 0, total: 100 },
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'online',
      deliveryType: 'pickup',
      razorpayOrderId: 'order_MockId12345',
      timeline: []
    });

    const razorpayPaymentId = 'pay_MockPaymentId5678';
    
    // Generate valid signature using the same secret
    const validSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret || 'test_secret')
      .update(`order_MockId12345|${razorpayPaymentId}`)
      .digest('hex');

    // Make request (Assuming auth middleware is mocked or we use valid token, 
    // but the verify-payment might need a farmer or shop token depending on routes)
    // For this test we will hit the endpoint. If auth is strictly required, 
    // it's best to mock the auth layer, or test the orderService directly.
    
    // As a direct service test for Razorpay Verification:
    const orderService = (await import('../services/order.service.js')).default;
    
    const result = await orderService.verifyPayment({
      razorpayOrderId: 'order_MockId12345',
      razorpayPaymentId,
      razorpaySignature: validSignature
    });

    expect(result.message).toBe('Payment verified successfully');
    
    const updated = await Order.findById(mockOrder._id);
    expect(updated.paymentStatus).toBe('paid');
    expect(updated.status).toBe('confirmed');
  });

  it('should reject invalid razorpay signature', async () => {
    const orderService = (await import('../services/order.service.js')).default;
    
    await expect(orderService.verifyPayment({
      razorpayOrderId: 'order_MockId12345',
      razorpayPaymentId: 'pay_Fake',
      razorpaySignature: 'invalid_signature_hash'
    })).rejects.toThrow('Invalid payment signature');
  });
});
