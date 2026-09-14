import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { signToken } from "../middleware/auth.js";

// 1. Register User
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        error: "Email is already in use"
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password)
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      token,
      user: user.toClient()
    });

  } catch (err) {
    next(err);
  }
}

// 2. User Login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const ok = await user.verifyPassword(password);

    if (!ok) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = signToken(user._id.toString());

    return res.json({
      token,
      user: user.toClient()
    });

  } catch (err) {
    next(err);
  }
}

// 3. Get Logged-In User Profile
export async function me(req, res, next) {
  try {
    return res.json({
      user: req.user.toClient()
    });
  } catch (err) {
    next(err);
  }
}

// 4. Update User Profile
export async function updateProfile(req, res, next) {
  try {
    const name =
      req.body.name !== undefined
        ? String(req.body.name).trim()
        : undefined;

    if (name === undefined) {
      return res.status(400).json({
        error: "Nothing to update"
      });
    }

    if (name.length < 2 || name.length > 32) {
      return res.status(400).json({
        error: "Name must be between 2 and 32 characters"
      });
    }

    req.user.name = name;

    await req.user.save();

    return res.json({
      user: req.user.toClient()
    });

  } catch (err) {
    next(err);
  }
}

// 5. Change Password
export async function changePassword(req, res, next) {
  try {
    const {
      currentPassword,
      nextPassword
    } = req.body;

    if (
      !currentPassword ||
      !nextPassword ||
      nextPassword.length < 6
    ) {
      return res.status(400).json({
        error: "New password must be at least 6 characters"
      });
    }

    const ok =
      await req.user.verifyPassword(
        currentPassword
      );

    if (!ok) {
      return res.status(400).json({
        error: "Current password is incorrect"
      });
    }

    req.user.passwordHash =
      await User.hashPassword(nextPassword);

    await req.user.save();

    return res.json({
      ok: true
    });

  } catch (err) {
    next(err);
  }
}

// 6. Delete User Account
export async function deleteAccount(req, res, next) {
  try {
    await Project.deleteMany({
      user: req.user._id
    });

    await req.user.deleteOne();

    return res.json({
      ok: true
    });

  } catch (err) {
    next(err);
  }
}