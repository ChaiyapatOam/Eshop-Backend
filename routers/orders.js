const { Product } = require("../models/product");
const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const { Store } = require("../models/store");
const router = express.Router();

function formatPhoneNumber(phoneNumberString) {
  phoneNumberString = phoneNumberString?.split("-");
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "" + match[1] + "-" + match[2] + "-" + match[3];
  }
  return null;
}

//Get All Order in store
router.get("/:store", async (req, res) => {
  const s = req.params.store;
  Order.find({ store: s }, (error, order) => {
    if (error) console.log(error);
    res.json(order);
  })
    .populate("user")
    .sort({ DateOrder: -1 });
});

/*
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: { path: "category" },
      },
    });
  //.populate('orderItems')

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});
*/

// POST Cart Order
router.post("/", async (req, res) => {
  const phone = formatPhoneNumber(req.body.phone);
  const storename = req.body.store;
  User.findOne({ phone: phone }, async (error, user) => {
    if (error) console.log(error);

    if (user == null) {
      let newuser = new User({
        name: req.body.name,
        phone: formatPhoneNumber(req.body.phone),
        address: req.body.address,
        store: req.body.store,
      });
      newuser = await newuser.save();
      let order = new Order({
        address: req.body.address,
        phone: formatPhoneNumber(req.body.phone),
        status: req.body.status,
        store: req.body.store,
        user: newuser._id,
        cart: req.body.cart,
        total: req.body.total,
        tracking: req.body.tracking,
      });
      order = await order.save();
      res.send(order);
      const s = req.body.store;
      const store = await Store.findOneAndUpdate(
        { store: s },
        { $push: { users: order.user } },
        { $push: { orders: order._id } },
        { new: true }
      );
    }

    if (user) {
      let order = new Order({
        address: req.body.address,
        phone: formatPhoneNumber(req.body.phone),
        status: req.body.status,
        store: req.body.store,
        user: user._id,
        cart: req.body.cart,
        total: req.body.total,
        tracking: req.body.tracking,
      });
      order = await order.save();

      if (!order)
        return res.status(400).status.send("The order cannot be created");

      res.send(order);
      const s = req.body.store;
      const store = await Store.findOneAndUpdate(
        { store: s },
        { $push: { orders: order._id } },
        { new: true }
      );
    }
  });
});

//Update Status
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      tracking: req.body.tracking,
    },
    { new: true }
  );
  if (!order) return res.status(404).status.send("The order cannot be created");

  res.send(order);
});

//Deleted Order
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, err: err });
    });
});

//Get Total Sale // Not Use
router.get("/get/totalsale", async (req, res) => {
  const TotalSale = await Order.aggregate([
    { $group: { _id: null, TotalSale: { $sum: "$TotalPrice" } } },
  ]);
  if (!TotalSale) {
    return res.status(400).send("The Order cannot be Sum ");
  }
  res.send({ TotalSale: TotalSale.pop().TotalSale });
});
//Get Total
router.post("/get/total", async (req, res) => {
  const store = req.body.store;
  const TotalSale = await Order.aggregate([
    { $match: { store: store } },
    {
      $group: { _id: null, TotalSale: { $sum: "$total" } },
    },
  ]);
  if (!TotalSale) {
    return res.status(400).send("The Order cannot be Sum ");
  }
  res.send({ total: TotalSale.pop() });
});

var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var today = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

//Get Total Daily
router.post("/get/total/today", async (req, res) => {
  const store = req.body.store;
  const TotalSale = await Order.aggregate([
    { $match: { store: store } },
    { $match: { status: "ได้รับสินค้า" } },
    { $addFields: { day: { $dayOfMonth: "$DateOrder" } } },
    { $match: { day: today } },
    {
      $group: {
        _id: null,
        // _id: { DateOrder: { $dayOfMonth: "$DateOrder" } },
        TotalSale: { $sum: "$total" },
      },
    },
  ]);
  if (!TotalSale) {
    return res.status(400).send("The Order cannot be Sum ");
  }
  try {
    res.send({ total: TotalSale.pop().TotalSale });
  } catch (err) {
    res.send({ total: 0 });
  }
});

//Get Total Monthly
router.post("/get/total/month", async (req, res) => {
  const store = req.body.store;
  const TotalSale = await Order.aggregate([
    { $match: { store: store } },
    { $match: { status: "ได้รับสินค้า" } },
    { $addFields: { month: { $month: "$DateOrder" } } },
    { $match: { month: month } },
    {
      $group: {
        _id: { MonthOrder: { $month: "$DateOrder" } },
        TotalSale: { $sum: "$total" },
      },
    },
  ]);
  try {
    res.send({ total: TotalSale.pop().TotalSale });
  } catch (err) {
    res.send({ total: 0 });
  }
});

//Count Daily Order in store
router.post("/get/today_count", async (req, res) => {
  const store = req.body.store;
  var now = new Date();
  var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(startOfToday);
  const orderCount = await Order.find({
    store: store,
    DateOrder: { $gte: startOfToday },
  }).count();

  if (!orderCount) {
    // res.status(500).json({ success: false });
    res.send({
      orderCount: 0,
    });
  }
  res.send({
    orderCount: orderCount,
  });
});
//Count All Order in store
router.post("/get/all_count", async (req, res) => {
  const store = req.body.store;
  const orderCount = await Order.find({
    store: store,
  }).count();

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

//Get User Order
router.get("/get/userorder/:userid", async (req, res) => {
  const userorderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: { path: "category" },
      },
    })
    .sort({ DateOrder: -1 });

  if (!userorderList) {
    res.status(500).json({ success: false });
  }
  res.send(userorderList);
});
module.exports = router;
