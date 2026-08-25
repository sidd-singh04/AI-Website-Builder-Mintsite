import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const STARTING_CREDITS = 20;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 32
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    credits: {
      type: Number,
      default: STARTING_CREDITS,
      min: 0
    },

    emailVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Static method → called using User.hashPassword()
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

// Instance method → called using user.verifyPassword()
userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Instance method → called using user.toClient()
userSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    credits: this.credits,
    emailVerified: Boolean(this.emailVerified),
    createdAt: this.createdAt
  };
};


export const User = mongoose.model("User", userSchema);