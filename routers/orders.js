const { Product } = require("../models/product");
const express = require("express");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const { Store } = require("../models/store");
const router = express.Router();
//Get All Order in store
router.get("/:store", async (req, res) => {
  const s = req.params.store;
  Order.find({ store: s }, (error, order) => {
    if (error) console.log(error);
    res.json(order);
  })
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: { path: "category" },
      },
    })
    .sort({ DateOrder: -1 });
});

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

/*
router.post("/", async (req, res) => {
  const orderItemsId = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdResolved = await orderItemsId;
  const TotalPrices = await Promise.all(
    orderItemsIdResolved.map(async (orderItemsId) => {
      const orderItem = await OrderItem.findById(orderItemsId).populate(
        "product",
        "price"
      );
      const TotalPrice = orderItem.product.price * orderItem.quantity;
      return TotalPrice;
    })
  );
  // console.log(TotalPrices);
  const TotalPrice = TotalPrices.reduce((a, b) => a + b, 0);
  let order = new Order({
    orderItems: orderItemsIdResolved,
    address: req.body.address,
    phone: req.body.phone,
    status: req.body.status,
    TotalPrice: TotalPrice,
    store: req.body.store,
    user: req.body.user,
    cart : req.body.cart
  });
  order = await order.save();

  if (!order) return res.status(400).status.send("The order cannot be created");

  res.send(order);
  const s = req.body.store
  const store = await  Store.findOneAndUpdate({store:s},
      { $push: {orders: order._id} },
      {new: true}
      )
}); */
// POST Cart Order
router.post("/", async (req, res) => {
  const phone = req.body.phone;
  const storename = req.body.store;
  User.findOne({ phone: phone }, async (error, user) => {
    if (error) console.log(error);

    if (user == null) {
      let newuser = new User({
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        store: req.body.store,
      });
      newuser = await newuser.save();
      let order = new Order({
        address: req.body.address,
        phone: req.body.phone,
        status: req.body.status,
        store: req.body.store,
        user: newuser._id,
        cart: req.body.cart,
        total: req.body.total,
      });
      order = await order.save();
      res.send(order);
      const s = req.body.store;
      const store = await Store.findOneAndUpdate(
        { store: s },
        { $push: { orders: order._id } },
        { $push: { users: newuser._id } },
        { new: true }
      );
    }

    if (user) {
      let order = new Order({
        address: req.body.address,
        phone: req.body.phone,
        status: req.body.status,
        store: req.body.store,
        user: user._id,
        cart: req.body.cart,
        total: req.body.total,
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
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
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
router.put("/get/total", async (req, res) => {
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
  res.send({ total: TotalSale.pop().TotalSale });
});
//Count Order
router.get("/get/count", async (req, res) => {
  const store = req.body.store;
  const orderCount = await Order.countDocuments();

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
