const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const validateId = (id, res, label = "Order ID") => {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    fail(res, 400, `${label} is invalid`);
  }
};

const requireUser = (req, res) => {
  if (!req.user?._id) {
    fail(res, 401, "Authentication required");
  }

  return req.user;
};

const requireAdmin = (req, res) => {
  const user = requireUser(req, res);

  if (!user.isAdmin) {
    fail(res, 403, "Admin access required");
  }

  return user;
};

// Calculate using integer minor units to reduce rounding errors.
const toMinorUnits = (value, res) => {
  const amount = Number(value);
  const minorUnits = Math.round(amount * 100);

  if (
    value == null ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(minorUnits)
  ) {
    fail(res, 500, "Product has an invalid price");
  }

  return minorUnits;
};

// @desc  Create a new order
// @route POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const user = requireUser(req, res);
  const { orderItems, shippingAddress, paymentMethod } = req.body || {};

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    fail(res, 400, "Please provide at least one order item");
  }

  if (
    !shippingAddress ||
    typeof shippingAddress !== "object" ||
    Array.isArray(shippingAddress) ||
    Object.keys(shippingAddress).length === 0
  ) {
    fail(res, 400, "Please provide a shipping address");
  }

  if (typeof paymentMethod !== "string" || !paymentMethod.trim()) {
    fail(res, 400, "Please provide a payment method");
  }

  // Combine duplicate product IDs before checking stock.
  const quantities = new Map();

  for (const item of orderItems) {
    validateId(item?.product, res, "Product ID");

    if (!Number.isSafeInteger(item.qty) || item.qty <= 0) {
      fail(res, 400, "Item quantity must be a positive whole number");
    }

    const productId = item.product.toLowerCase();
    const quantity = (quantities.get(productId) || 0) + item.qty;

    if (!Number.isSafeInteger(quantity)) {
      fail(res, 400, "Item quantity is too large");
    }

    quantities.set(productId, quantity);
  }

  const session = await Order.db.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const verifiedItems = [];
      let itemsTotal = 0;

      // Keep transaction operations sequential.
      for (const [productId, qty] of quantities) {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          fail(res, 404, `Product not found: ${productId}`);
        }

        const price = toMinorUnits(
          product.discountPrice > 0
            ? product.discountPrice
            : product.price,
          res
        );

        const lineTotal = price * qty;

        if (
          !Number.isSafeInteger(lineTotal) ||
          !Number.isSafeInteger(itemsTotal + lineTotal)
        ) {
          fail(res, 400, "Order total is too large");
        }

        // The stock condition prevents decrementing below zero.
        const result = await Product.updateOne(
          {
            _id: product._id,
            stock: { $gte: qty },
          },
          {
            $inc: { stock: -qty },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          fail(res, 409, `Insufficient stock for ${product.name}`);
        }

        itemsTotal += lineTotal;

        verifiedItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: price / 100,
          qty,
        });
      }

      // Preserve your existing rule: free shipping above 5,000.
      const shippingTotal = itemsTotal > 500000 ? 0 : 12000;
      const total = itemsTotal + shippingTotal;

      if (!Number.isSafeInteger(total)) {
        fail(res, 400, "Order total is too large");
      }

      const [order] = await Order.create(
        [
          {
            user: user._id,
            orderItems: verifiedItems,
            shippingAddress,
            paymentMethod: paymentMethod.trim(),
            itemsPrice: itemsTotal / 100,
            shippingPrice: shippingTotal / 100,
            totalPrice: total / 100,
          },
        ],
        { session }
      );

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json(createdOrder);
});

// @desc  Get the logged-in user's orders
// @route GET /api/orders/mine
const getMyOrders = asyncHandler(async (req, res) => {
  const user = requireUser(req, res);

  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc  Get an order by ID
// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const user = requireUser(req, res);
  validateId(req.params.id, res);

  const order = await Order.findById(req.params.id);

  if (!order) {
    fail(res, 404, "Order not found");
  }

  // Check ownership before population, including deleted-user cases.
  if (String(order.user) !== String(user._id) && !user.isAdmin) {
    fail(res, 403, "Not authorized to view this order");
  }

  await order.populate("user", "name email");

  res.json(order);
});

// @desc  Get all orders
// @route GET /api/orders
// @access Admin
const getOrders = asyncHandler(async (req, res) => {
  requireAdmin(req, res);

  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc  Update an order's status
// @route PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  requireAdmin(req, res);
  validateId(req.params.id, res);

  const { orderStatus } = req.body || {};

  if (typeof orderStatus !== "string" || !orderStatus.trim()) {
    fail(res, 400, "Please provide an order status");
  }

  const status = orderStatus.trim();
  const allowedStatuses =
    Order.schema.path("orderStatus")?.enumValues || [];

  if (allowedStatuses.length && !allowedStatuses.includes(status)) {
    fail(res, 400, "Invalid order status");
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    fail(res, 404, "Order not found");
  }

  order.orderStatus = status;

  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || new Date();
  } else {
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
};
