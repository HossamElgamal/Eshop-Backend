const { orders } = require("../models/order");
const { orderItems } = require("../models/order-item");
const express = require("express");

const router = express.Router();

//GET ALL ORDERS
router.get(`/`, async (req, res) => {
  const orderList = await orders
    .find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(orderList);
});

//GET ORDER BY ID
router.get(`/:id`, async (req, res) => {
  const order = await orders
    .findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });

  if (!order) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

//ADD A NEW ORDER
router.post("/", async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new orderItems({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemResloved = await orderItemIds;

  const totalprices = await Promise.all(
    orderItemResloved.map(async (orderitemid) => {
      const orderItem = await orderItems
        .findById(orderitemid)
        .populate("product", "price");
      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );
  const totalPrice = totalprices.reduce((a, b) => a + b, 0);

  console.log(totalprices);
  const myOrders = new orders({
    orderItems: orderItemResloved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });

  orderDB = await myOrders.save();

  if (!orderDB) return res.status(404).send("No Product Has Orders");

  return res.send(orderDB);
});

//UPDATE ORDER
router.put("/:id", async (req, res) => {
  const order = await orders.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order) return res.status(400).send("No orders");

  return res.send(order);
});

//DELETE ORDER
router.delete("/:id", (req, res) => {
  orders
    .findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await orderItems.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

//GET TOTAL SALES
router.get("/get/totalsales", async (req, res) => {
  //HOW MANY ORDERS IN E-SHOP
  const totalSales = await orders.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("the order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalSales });
});

router.get(`/get/count`, async (req, res) => {
  const orderCount = await orders.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({ orderCount: orderCount });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await orders
    .find({ user: req.params.userid })

    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dataOrdered: -1 });

  if (!userOrderList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(userOrderList);
});

module.exports = router;

/*router.post("/", (req, res) => {
  const order = new orders({
    name: req.body.name,
    Image: req.body.Image,
    countInStock: req.body.countInStock,
  });
  order
    .save()
    .then((createOrder) => {
      res.status(201).json(createOrder);
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
        success: false,
      });
    });
});*/
