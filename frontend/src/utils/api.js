import axios from "axios";

// ============================================================
// AXIOS API INSTANCE
// ============================================================

export const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api",

  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// ADD TOKEN TO EVERY REQUEST
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// ============================================================
// GLOBAL RESPONSE ERROR HANDLER
// ============================================================

API.interceptors.response.use(
  (res) => res,

  (err) => {
    const url = err.config?.url || "";

    // GitHub / Vercel endpoints should not
    // automatically log the user out on 401.
    const isThirdParty =
      /(?:deploy|github)$/i.test(url);

    if (
      err.response?.status === 401 &&
      !isThirdParty
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);


// ============================================================
// ERROR HELPER
// ============================================================

export const apiError = (err) =>
  err?.response?.data?.error ||
  err?.message ||
  "Something went wrong";


// Helper to return only response.data
const body = (promise) =>
  promise.then((res) => res.data);


// ============================================================
// AUTH
// Backend:
// app.use("/api/auth", authRouter);
// ============================================================

// Register
export const register = (data) =>
  body(
    API.post("/auth/register", data)
  );


// Verify registration OTP
export const registerVerify = (
  email,
  code
) =>
  body(
    API.post(
      "/auth/register/verify",
      {
        email,
        code,
      }
    )
  );


// Resend registration OTP
export const registerResend = (
  email
) =>
  body(
    API.post(
      "/auth/register/resend",
      {
        email,
      }
    )
  );


// Login
export const login = (data) =>
  body(
    API.post("/auth/login", data)
  );


// Get logged-in user
export const getMe = () =>
  body(
    API.get("/auth/me")
  );


// Update profile
export const updateProfile = (
  data
) =>
  body(
    API.patch(
      "/auth/me",
      data
    )
  );


// Change password
export const changePassword = (
  data
) =>
  body(
    API.patch(
      "/auth/me/password",
      data
    )
  );


// Delete account
export const deleteMyAccount = () =>
  body(
    API.delete("/auth/me")
  );


// Contribution history
export const getContributions = () =>
  body(
    API.get("/auth/me/contributions")
  );


// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotRequest = (
  email
) =>
  body(
    API.post(
      "/auth/forgot/request",
      {
        email,
      }
    )
  );


export const forgotVerifyCode = (
  email,
  code
) =>
  body(
    API.post(
      "/auth/forgot/verify-code",
      {
        email,
        code,
      }
    )
  );


export const forgotReset = (
  email,
  code,
  newPassword
) =>
  body(
    API.post(
      "/auth/forgot/reset",
      {
        email,
        code,
        newPassword,
      }
    )
  );


// ============================================================
// PROJECTS
// Backend:
// app.use("/api/projects", projectRouter);
// ============================================================

export const getProjects = () =>
  body(
    API.get("/projects")
  );


export const createProject = (
  data
) =>
  body(
    API.post(
      "/projects",
      data
    )
  );


export const getProject = (
  id
) =>
  body(
    API.get(
      `/projects/${id}`
    )
  );


export const updateProject = (
  id,
  data
) =>
  body(
    API.patch(
      `/projects/${id}`,
      data
    )
  );


export const deleteProject = (
  id
) =>
  body(
    API.delete(
      `/projects/${id}`
    )
  );


export const generateProject = (
  id,
  prompt
) =>
  body(
    API.post(
      `/projects/${id}/generate`,
      {
        prompt,
      }
    )
  );


export const uploadToGithub = (
  id,
  data
) =>
  body(
    API.post(
      `/projects/${id}/github`,
      data
    )
  );


export const deployToVercel = (
  id,
  data
) =>
  body(
    API.post(
      `/projects/${id}/deploy`,
      data
    )
  );


// ============================================================
// COMMUNITY
// Backend:
// app.use("/api/community", communityRouter);
// ============================================================

export const getCommunity = (
  sort = "new"
) =>
  body(
    API.get(
      `/community?sort=${sort}`
    )
  );


export const getCommunityProject = (
  id
) =>
  body(
    API.get(
      `/community/${id}`
    )
  );


export const likeCommunityProject = (
  id
) =>
  body(
    API.post(
      `/community/${id}/like`
    )
  );


// ============================================================
// PAYMENTS
// Backend:
// app.use("/api/payments", paymentRouter);
// ============================================================

export const getPackages = () =>
  body(
    API.get(
      "/payments/packages"
    )
  );


export const createOrder = (
  packageId
) =>
  body(
    API.post(
      "/payments/create-order",
      {
        packageId,
      }
    )
  );


export const verifyPayment = (
  data
) =>
  body(
    API.post(
      "/payments/verify",
      data
    )
  );


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default API;