const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Set the response status and pass the error to Express middleware.
const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const validatePhone = (phone, res) => {
  if (phone !== undefined && typeof phone !== "string") {
    fail(res, 400, "Phone must be a string");
  }
};

const getAuthenticatedUser = async (req, res) => {
  if (!req.user?._id) {
    fail(res, 401, "Authentication required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    fail(res, 404, "User not found");
  }

  return user;
};

const authResponse = (user) => ({
  user: user.toSafeObject(),
  token: generateToken(user._id),
});

// @desc  Register a new user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (
    !isNonEmptyString(name) ||
    !normalizedEmail ||
    !isNonEmptyString(password)
  ) {
    fail(res, 400, "Please provide name, email and password");
  }

  validatePhone(phone, res);

  const userExists = await User.exists({ email: normalizedEmail });

  if (userExists) {
    fail(res, 409, "An account with this email already exists");
  }

  let user;

  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      ...(phone !== undefined && { phone: phone.trim() }),
    });
  } catch (error) {
    // Handle simultaneous registrations with the same email.
    if (
      error.code === 11000 &&
      (error.keyPattern?.email || error.keyValue?.email !== undefined)
    ) {
      fail(res, 409, "An account with this email already exists");
    }

    throw error;
  }

  res.status(201).json(authResponse(user));
});

// @desc  Login a user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !isNonEmptyString(password)) {
    fail(res, 400, "Please provide email and password");
  }

  // Include the password hash if the schema uses select: false.
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    fail(res, 401, "Invalid email or password");
  }

  res.json(authResponse(user));
});

// @desc  Get the current user's profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req, res);

  res.json(user.toSafeObject());
});

// @desc  Update the current user's profile
// @route PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body || {};
  const user = await getAuthenticatedUser(req, res);

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      fail(res, 400, "Name must be a non-empty string");
    }

    user.name = name.trim();
  }

  validatePhone(phone, res);

  if (phone !== undefined) {
    user.phone = phone.trim();
  }

  if (password !== undefined) {
    if (!isNonEmptyString(password)) {
      fail(res, 400, "Password must be a non-empty string");
    }

    user.password = password;
  }

  const updatedUser = await user.save();

  res.json(updatedUser.toSafeObject());
});

// @desc  Replace the current user's address list
// @route PUT /api/auth/addresses
const setAddresses = asyncHandler(async (req, res) => {
  const { addresses } = req.body || {};

  if (
    !Array.isArray(addresses) ||
    addresses.some(
      (address) =>
        address === null ||
        typeof address !== "object" ||
        Array.isArray(address)
    )
  ) {
    fail(res, 400, "Addresses must be an array of address objects");
  }

  const user = await getAuthenticatedUser(req, res);

  // An empty array explicitly removes all saved addresses.
  user.addresses = addresses;

  await user.save();

  res.json(user.toSafeObject());
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  setAddresses,
};
