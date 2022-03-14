const { User } = require("../models/user");
const {Store} = require("../models/store")
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
function formatPhoneNumber(phoneNumberString) {
  phoneNumberString = phoneNumberString?.split('-')
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '' + match[1] + '-' + match[2] + '-' + match[3]
  }
  return null
}

//GET All user
router.get("/", async (req, res) => {
  const userList = await User.find();

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:store", async (req, res) => {
  const s = req.params.store;
  User.find({ store: s }, (error, user) => {
    if (error) console.log(error);
    res.json(user);
  });

});
//get user by phone
router.put("/", async (req, res) => {
  const phone = formatPhoneNumber(req.body.phone);
  User.findOne({ phone: phone }, (error, user) => {
    if (error) console.log(error);
    if (user == null) res.send([]);
    if (user) res.json(user);
  });
});

/*GET User by id 
router.get('/:id', async (req,res) =>{
    const user = await User.findById(req.params.id).select('-passwordHash')

    if(!user)
        res.status(500).json({message:"The user with the givern id was not found"})
    
    res.status(200).send(user)
}) */

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    store: req.body.store,
  });
  user = await user.save();

  if (!user) return res.status(404).status.send("The user cannot be created");

  res.send(user);
});
router.post("/login", async (req, res) => {
  const user = await User.findOne({ name: req.body.name });

  if (!user) {
    return res.status(400).send("The user was not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      "secret"
    );
    res.status(200).send({ user: user.name, token: token });
  } else {
    res.status(400).send("password is wrong");
  }
});

// Count User
router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});
//Delete User
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, err: err });
    });
});

module.exports = router;
