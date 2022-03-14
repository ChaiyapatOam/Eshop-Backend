const { Store } = require("../models/store");
const { Product } = require("../models/product");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const jwt_decode = require("jwt-decode");

function formatPhoneNumber(phoneNumberString) {
  phoneNumberString = phoneNumberString?.split("-");
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "" + match[1] + "-" + match[2] + "-" + match[3];
  }
  return null;
}

// get All Store Super Admin
router.get("/", (req, res) => {
  Store.find((error, products) => {
    if (error) console.log(error);
    res.json(products);
  }).select("-passwordHash -products");
});

// get one store by store /store/<name> is active  ใช้ที่หน้าร้าน
router.get("/:store", (req, res) => {
  const s = req.params.store;
  Store.find({ $and: [{ store: s }, { active: true }] }, (error, products) => {
    if (error) console.log(error);
    res.json(products);
  })
    .populate({ path: "products", match: { active: true } })
    .select("-passwordHash  -users -orders");
});

//BackOffice Admin Owner
router.get("/admin/store/:id", (req, res) => {
  const id= req.params.id;
  Store.find({ _id:id}, (error, store) => {
    if (error) console.log(error);
    res.json(store);
  })
    // .populate({ path: "products"})
    .select("-passwordHash  -users -orders");
});

//Back office ใช้ในระบบหลังร้าน
router.get("/admin/product/:store", (req, res) => {
  const s = req.params.store;
  Store.find({ store: s }, (error, products) => {
    if (error) console.log(error);
    res.json(products);
  }).populate({ path: "products" });
});

//GET users in store
router.get("/admin/users/:store", (req, res) => {
  const s = req.params.store;
  Store.find({ store: s }, (error, users) => {
    if (error) console.log(error);
    res.json(users);
  }).populate({ path: "users" });
});

// update status  active/inactive
router.put("/status/:store", async (req, res) => {
  const s = req.params.store;

  const store = await Store.findOneAndUpdate(
    { store: s },
    {
      active: req.body.active,
    },
    { new: true }
  );

  res.send(store);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const store = await Store.findByIdAndUpdate(
    id,
    {
      store: req.body.store,
      active: req.body.active,
      email: req.body.email,
      address: req.body.address,
      phone: formatPhoneNumber(req.body.phone),
    },
    { new: true }
  );

  res.send(store);
});
//Update Password store
router.put("/update_password/:id", async (req, res) => {
  const id = req.params.id;
  const store = await Store.findByIdAndUpdate(
    id,
    {
      store: req.body.store,
      active: req.body.active,
      email: req.body.email,
      address: req.body.address,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: formatPhoneNumber(req.body.phone),
    },
    { new: true }
  );

  res.send(store);
});

// Add new store
router.post("/", async (req, res) => {
  let store = new Store({
    store: req.body.store,
    email: req.body.email.toLowerCase(),
    address: req.body.address,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: formatPhoneNumber(req.body.phone),
    products: req.body.products,
    users: req.body.users,
  });
  store = await store.save();

  if (!store) return res.status(404).status.send("The store cannot be created");

  res.send(store);
});

//Login  admin
router.post("/admin/login", async (req, res) => {
  try {
    const store = await Store.findOne({ email: req.body.email.toLowerCase() });
    if (!store) {
      return res.status(400).send("The store was not found");
    }
    if (store && bcrypt.compareSync(req.body.password, store.passwordHash)) {
      const token = jwt.sign(
        {
          store_id: store.id,
          store: store.store,
        },
        "secret",
        {
          expiresIn: "5m",
        }
      );

      var decoded = jwt_decode(token);
      res.status(200).send({ email: store.email, token: token, data: decoded });
    } else {
      res.status(401).send("Login fail");
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
