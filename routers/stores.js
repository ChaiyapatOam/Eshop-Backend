const { Store } = require("../models/store");
const { Product } = require("../models/product");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const jwt_decode = require("jwt-decode");
// get All Store
router.get("/", (req, res) => {
  Store.find((error, products) => {
    if (error) console.log(error);
    res.json(products);
  }).select("-passwordHash -products");
});
// get one store by store /store/<name> is active
router.get("/:store", (req, res) => {
  const s = req.params.store;
  Store.find({ $and: [{ store: s }, { active: true }] }, (error, products) => {
    if (error) console.log(error);
    res.json(products);
  }).populate({ path: "products" });
});
router.get("/product/:store", (req, res) => {
  const s = req.params.store;
  Store.find({ store: s } , (error, products) => {
    if (error) console.log(error);
    res.json(products);
  }).populate({ path: "products" });
});
// update store
router.put("/:store", async (req, res) => {
  const s = req.params.store;
  const store = await Store.findOneAndUpdate(
    { store: s },
    {
      store: req.body.store,
      active: req.body.active,
      admin: req.body.admin,
      address: req.body.address,
      phone: req.body.phone,
    },
    { new: true }
  );
  // if(!store)
  // return res.status(404).status.send('The store cannot be created')

  res.send(store);
});

// Add new store
router.post("/", async (req, res) => {
  let store = new Store({
    store: req.body.store,
    email: req.body.email,
    address: req.body.address,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    products: req.body.products,
  });
  store = await store.save();

  if (!store) return res.status(404).status.send("The store cannot be created");

  res.send(store);
});
// add product in store
router.put("/add/:store", async (req, res) => {
  const s = req.params.store;
  const store = await Store.findOneAndUpdate(
    { store: s },
    { $push: { products: req.body.products } },
    { new: true }
  );
  if (!store) return res.status(404).status.send("The store cannot be created");

  res.send(store);
});
//Login  admin
router.post("/admin/login", async (req, res) => {
  try {
    const store = await Store.findOne({ email: req.body.email });
    console.log(store);
    if (!store) {
      return res.status(400).send("The store was not found");
    }
    if (store && bcrypt.compareSync(req.body.password, store.passwordHash)) {
      const token = jwt.sign(
        {
          store_id: store.id,
          store: store.store,
        },
        "secret"
      );

      var decoded = jwt_decode(token);
      res.status(200).send({ email: store.email, token: token, data: decoded });
    } else {
      res.status(400).send("password is wrong");
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
