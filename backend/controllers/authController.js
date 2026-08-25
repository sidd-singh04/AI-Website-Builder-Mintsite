import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import {
  generateOtp,
  saveOtp,
  sendOtpEmail,
  verifyOtp,
  peekOtp
} from "../utils/services.js";
import { signToken } from "../middleware/auth.js";

// Helper function to issue and send OTP
async function issueAndSend(email, name, status, res, code = 201) {
  const OTP = generateOtp();

  saveOtp(email, OTP);

  await sendOtpEmail({
    to: email,
    name,
    code: OTP,
    purpose: status
  });

  return res.status(code).json({
    ok: true,
    email
  });
}

// 1. Register User and send OTP
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
      if (existing.emailVerified) {
        return res.status(409).json({
          error: "Email is already in use"
        });
      }

      return issueAndSend(
        email,
        existing.name,
        "signup",
        res,
        200
      );
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      emailVerified: false
    });

    return issueAndSend(
      user.email,
      user.name,
      "signup",
      res,
      201
    );

  } catch (err) {
    next(err);
  }
}

// 2. Verify Registration OTP
export async function verifyRegister(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and code are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        ok: true,
        alreadyVerified: true
      });
    }

    const result = verifyOtp(email, code);

    if (!result.ok) {
      return res.status(400).json({
        error: result.reason
      });
    }

    user.emailVerified = true;

    await user.save();

    return res.status(200).json({
      ok: true
    });

  } catch (err) {
    next(err);
  }
}

// 3. Resend Registration OTP
export async function resendRegister(req, res, next) {
  try {
    const email = (req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No account found with this email"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email is already verified"
      });
    }

    return issueAndSend(
      email,
      user.name,
      "signup",
      res,
      200
    );

  } catch (err) {
    next(err);
  }
}

// 4. User Login
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

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email first",
        needsVerification: true,
        email: user.email
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

// 5. Get Logged-In User Profile
export async function me(req, res, next) {
  try {
    return res.json({
      user: req.user.toClient()
    });
  } catch (err) {
    next(err);
  }
}

// 6. Contribution History
export async function contributions(req, res, next) {
  try {
    const oneYearAgo = new Date();

    oneYearAgo.setUTCHours(0, 0, 0, 0);
    oneYearAgo.setUTCDate(
      oneYearAgo.getUTCDate() - 364
    );

    const projects = await Project.find({
      user: req.user._id,
      updatedAt: {
        $gte: oneYearAgo
      }
    }).select("messages createdAt updatedAt");

    const counts = {};

    projects.forEach((project) => {

      const createdDate = new Date(
        project.createdAt
      )
        .toISOString()
        .split("T")[0];

      counts[createdDate] =
        (counts[createdDate] || 0) + 1;

      project.messages.forEach((msg) => {

        if (msg.role === "user") {

          const msgDate = new Date(
            msg.createdAt
          )
            .toISOString()
            .split("T")[0];

          counts[msgDate] =
            (counts[msgDate] || 0) + 2;
        }
      });
    });

    return res.json({
      counts
    });

  } catch (err) {
    next(err);
  }
}

// 7. Update User Profile
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

// 8. Change Password
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

// 9. Delete User Account
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