import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    packageId: {
      type: String,
      required: true
    },

    creditPurchase: {
      type: Number,
      required: true,
      min: 0
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String,
      default: ""
    },

    razorpaySignature: {
      type: String,
      default: ""
    },

    status: {
      type: String,

      enum: [
        "created",
        "paid",
        "failed"
      ],

      default: "created",

      index: true
    }
  },

  {
    timestamps: true
  }
);


// Safe client representation
paymentSchema.methods.toClient = function () {

  return {

    id: this._id.toString(),

    packageId: this.packageId,

    creditPurchase: this.creditPurchase,

    amount: this.amount,

    currency: this.currency,

    status: this.status,

    createdAt: this.createdAt

  };

};


export const Payment = mongoose.model("Payment", paymentSchema);