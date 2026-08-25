import { Payment } from "../models/Payment.js";

import {
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../utils/services.js";


// Packages
const packages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    amount: 49900,
    displayAmount: 499,
    currency: "INR"
  },

  {
    id: "popular",
    name: "Popular Package",
    credits: 200,
    amount: 149900,
    displayAmount: 1499,
    currency: "INR"
  },

  {
    id: "pro",
    name: "Pro Package",
    credits: 500,
    amount: 299900,
    displayAmount: 2999,
    currency: "INR"
  }
];


// 1. Get available packages
export function listPackages(req, res) {
  return res.json({
    packages,
    configured: isRazorpayConfigured()
  });
}


// 2. Create Razorpay Order
export async function createOrder(req, res, next) {
  try {

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        error:
          "Payments are not configured. Please add Razorpay keys to the backend .env file."
      });
    }

    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({
        error: "The package id is required."
      });
    }

    const pkg = packages.find(
      (p) => p.id === packageId
    );

    if (!pkg) {
      return res.status(400).json({
        error: "Unknown package."
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: pkg.amount,
      currency: pkg.currency,
      receipt: `receipt_${req.user._id}_${Date.now()}`,

      notes: {
        userId: req.user._id.toString(),
        packageId: pkg.id,
        credits: String(pkg.credits)
      }
    });

    // Store payment in database
    await Payment.create({
      user: req.user._id,
      packageId: pkg.id,
      creditPurchase: pkg.credits,
      amount: pkg.amount,
      currency: pkg.currency,
      razorpayOrderId: order.id,
      status: "created"
    });

    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      packageId: pkg.id,
      credits: pkg.credits
    });

  } catch (err) {
    next(err);
  }
}


// 3. Verify Razorpay Payment
export async function verifyPayment(req, res, next) {
  try {

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        error: "Razorpay is not configured."
      });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        error: "Payment verification details are missing."
      });
    }

    // Find the order belonging to this authenticated user
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id
    });

    if (!payment) {
      return res.status(404).json({
        error: "Payment order not found."
      });
    }

    // Prevent double crediting
    if (payment.status === "paid") {
      return res.json({
        ok: true,
        alreadyCredited: true,
        user: req.user.toClient()
      });
    }

    // Verify Razorpay signature
    const isValid = await verifyRazorpayPayment({
      orderId: payment.razorpayOrderId,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        error: "Invalid payment signature."
      });
    }

    // Payment is genuine
    payment.status = "paid";

    payment.razorpayPaymentId =
      razorpay_payment_id;

    payment.razorpaySignature =
      razorpay_signature;

    await payment.save();

    // Add credits
    req.user.credits += payment.creditPurchase;

    await req.user.save();

    return res.json({
      ok: true,
      user: req.user.toClient()
    });

  } catch (err) {
    next(err);
  }
}


// 4. Payment History
export async function listHistory(req, res, next) {
  try {

    const list = await Payment.find({
      user: req.user._id,
      status: "paid"
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      payments: list.map(
        (p) => p.toClient()
      )
    });

  } catch (err) {
    next(err);
  }
}