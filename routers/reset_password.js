const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello World!!!123");
});
router.post("/reset_password", async (req, res) => {
  try {
    const email = req.body.email;
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "chaiyapat4579@gmail.com", // generated ethereal user
        pass: "1329901215540", // generated ethereal password
      },
    });

    // send mail with defined transport object
    const msg = {
      from: '"nuxt Eshop" <nuxtEshop@gmail.com>', // sender address
      to: `${email}`, // list of receivers
      subject: "กู้คืนรหัสผ่าน", // Subject line
      text: `กู้คืนรหัสผ่านของคุณโดยการกดลิ้งนี้`, // plain text body
    };
    // send mail with defined transport object  const info = await transporter.sendMail(msg);
    let err = new Error("Unexpected socket close");
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.send("OK");
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
