const asyncHandler = require("express-async-handler");
const SSLCommerzPayment = require("sslcommerz-lts");
const Order = require("../models/Order");

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";

// @desc  Initiate SSLCommerz payment session for an order
// @route POST /api/payment/sslcommerz/init/:orderId
const initSSLCommerz = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this order");
  }

  const tran_id = `TXN-${order._id}-${Date.now()}`;

  const data = {
    total_amount: order.totalPrice,
    currency: "BDT",
    tran_id,
    success_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payment/sslcommerz/success/${order._id}`,
    fail_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payment/sslcommerz/fail/${order._id}`,
    cancel_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payment/sslcommerz/cancel/${order._id}`,
    ipn_url: `${process.env.SERVER_URL || "http://localhost:5000"}/api/payment/sslcommerz/ipn`,
    shipping_method: "Courier",
    product_name: order.orderItems.map((i) => i.name).join(", ").slice(0, 250),
    product_category: "Furniture",
    product_profile: "physical-goods",
    cus_name: order.shippingAddress.fullName,
    cus_email: req.user.email,
    cus_add1: order.shippingAddress.addressLine,
    cus_city: order.shippingAddress.city,
    cus_postcode: order.shippingAddress.postCode || "1000",
    cus_country: order.shippingAddress.country || "Bangladesh",
    cus_phone: order.shippingAddress.phone,
    ship_name: order.shippingAddress.fullName,
    ship_add1: order.shippingAddress.addressLine,
    ship_city: order.shippingAddress.city,
    ship_postcode: order.shippingAddress.postCode || "1000",
    ship_country: order.shippingAddress.country || "Bangladesh",
  };

  order.paymentResult = { transactionId: tran_id, status: "initiated", updateTime: new Date().toISOString() };
  await order.save();

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const apiResponse = await sslcz.init(data);

  if (apiResponse?.GatewayPageURL) {
    res.json({ url: apiResponse.GatewayPageURL });
  } else {
    res.status(502);
    throw new Error("Failed to initiate payment session");
  }
});

// SSLCommerz redirects (server-side POST) land here, then we redirect the browser to the frontend
const handleSuccess = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (order) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = "processing";
    if (order.paymentResult) order.paymentResult.status = "success";
    await order.save();
  }
  res.redirect(`${process.env.CLIENT_URL}/order/${req.params.orderId}?payment=success`);
});

const handleFail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (order && order.paymentResult) {
    order.paymentResult.status = "failed";
    await order.save();
  }
  res.redirect(`${process.env.CLIENT_URL}/order/${req.params.orderId}?payment=failed`);
});

const handleCancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (order && order.paymentResult) {
    order.paymentResult.status = "cancelled";
    await order.save();
  }
  res.redirect(`${process.env.CLIENT_URL}/order/${req.params.orderId}?payment=cancelled`);
});

// IPN (instant payment notification) - SSLCommerz server-to-server validation
const handleIPN = asyncHandler(async (req, res) => {
  // In production, validate req.body.val_id via sslcz.validate() before trusting it.
  res.status(200).send("IPN received");
});

module.exports = { initSSLCommerz, handleSuccess, handleFail, handleCancel, handleIPN };
