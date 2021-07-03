const { myUsers } = require("../models/user");
const express = require("express");
const bycript = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

//Creating Api
router.get(`/`, async (req, res) => {
  const userList = await myUsers.find().select("-passwordHash");

  if (!userList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});

// GET SINGLE USER

router.get("/:id", async (req, res) => {
  const user = await myUsers.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res.status(500).json({ message: "The User With Given Id Not Found " });
  }

  res.status(200).send(user);
});

//Get User Count

router.get(`/:get/count`, async (req, res) => {
  const usercount = await myUsers.countDocuments((count) => count);

  if (usercount) {
    res.status(200).send({ usercount: usercount });
  } else {
    res.status(500).json({
      success: false,
      message: "No Such id Is Exists In users",
    });
  }
});

//Add User

router.post(`/`, async (req, res) => {
  const user = new myUsers({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bycript.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  userCheck = await user.save();

  if (!userCheck) return res.status(400).send("User Not Found");

  res.send(userCheck);
});

//DELETE USER
router.delete("/:id", (req, res) => {
  myUsers
    .findByIdAndRemove(req.params.id)
    .then((userdeleted) => {
      if (userdeleted) {
        res.status(200).json({
          success: true,
          message: "Deleted Sucssefuly ",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Something Went Wrong ",
        });
      }
    })
    .catch((err) => {
      return res.status(404).json({
        success: false,
        error: err,
      });
    });
});

//UPDATE USER

router.put("/:id", async (req, res) => {
  const userExist = await myUsers.findById(req.params.id);
  let newPassword;

  if (req.body.password) {
    newPassword = bycript.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const updateUser = await myUsers.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    },
    {
      new: true,
    }
  );

  if (!updateUser) return res.status(404).send("Product Cannot Be Updated ");

  res.send(updateUser);
});

router.post("/login", async (req, res) => {
  const user = await myUsers.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).send("user not found ");
  }

  if (user && bycript.compareSync(req.body.password, user.passwordHash)) {
    const secret = process.env.secret;
    const token = jwt.sign(
      {
        userid: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wronng");
  }
});

router.post("/register", async (req, res) => {
  let user = new myUsers({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bycript.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  if (!user) return res.status(400).send("the user cannot be created ! ");

  res.send(user);
});
module.exports = router;
