const { myProduct } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const multer = require("multer");

const mongoose = require("mongoose");

const FILE_TYPE_MAP = {
  //mime
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  //Control for destination
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];

    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  // Control for filename
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

//MyApi

//GET ALL PRODUCTS
router.get(`/`, async (req, res) => {
  let filter = {};

  if (req.query.categories) {
    filter = { categorye: req.query.categories.split(",") };
  }

  const productList = await myProduct.find(filter).populate("category");

  if (!productList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(productList);
});

//GET PRODUCT BY ID

router.get("/:id", async (req, res) => {
  const productID = await myProduct
    .findById(req.params.id)
    .populate("category");

  if (productID) {
    res.status(200).send(productID);
  } else {
    res.status(500).json({
      success: false,
      message: "No Such id Is Exists In Products",
    });
  }
});

// ADD NEW PRODUCT

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category"); // CHECK IF THE USER ENTER CATEGORY ID IS CORRECT

  const file = req.file;

  if (!file) return res.status(400).send("No image in the request ");
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const product = new myProduct({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath} ${fileName}`, //"http://localhost:3000/public/upload/image-12321321"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  productDB = await product.save();

  if (!productDB) return res.status(404).send("the product cannot be created");

  return res.send(productDB);
});

//UPDATE PRODUCT & UPDATE MAIN IMAGE

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id ");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await myProduct.findById(req.params.id);

  if (!product) return res.status(400).send("invalid product");

  const file = req.file;

  let imagePath;

  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    imagePath = `${basePath} ${fileName}`;
  } else {
    imagePath = product.image;
  }

  const updatedproduct = await myProduct.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    {
      new: true,
    }
  );

  if (!updatedproduct)
    return res.status(404).send("The Product Cannot be Updated");

  res.send(updatedproduct);
});

//DELETE PRODUCT

router.delete("/:id", (req, res) => {
  myProduct
    .findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "the Product is Deleted  ",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found Not Found ",
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

//End Of MyAPI

//GET PRODUCTS COUNT
router.get("/get/count", async (req, res) => {
  const productCount = await myProduct.countDocuments((count) => count);

  if (productCount) {
    res.status(200).send({ productCount: productCount });
  } else {
    res.status(500).json({
      success: false,
      message: "No Such id Is Exists In Products",
    });
  }
});

// Get Featured Products Whis IsFeature Only True And Specify The Number Of Featured Product
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await myProduct.find({ isFeatured: true }).limit(+count);

  if (!products) {
    res.status(500).json({ success: false });
  }

  res.send(products);
});

// Multi Images
router.put(
  "/gallery-images/:id",
  //10=> number of file to be uploaded
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Product Id ");
    }

    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const files = req.files;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await myProduct.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      {
        new: true,
      }
    );
    if (!product) return res.status(404).send("the product cannot be created");

    return res.send(product);
  }
);

module.exports = router;
