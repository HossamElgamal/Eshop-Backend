const { Category } = require("../models/category");
const express = require("express");

const router = express.Router();

//MyApi

//GET METHOD
router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({
      success: false,
    });
  }

  res.status(200).send(categoryList);
});

//GET CATEGORY BY ID
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.status(200).send(category);
  } else {
    res.status(500).json({
      success: false,
      message: "No Such id Is Exists",
    });
  }
});

//ADD A NEW CATEGORY
router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();
  if (!category) return res.status(404).send("Category Cannot Be Created ");

  res.send(category);
});

//UPDATA CATEGORY
router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    {
      new: true,
    }
  );

  if (!category)
    return res.status(404).send("the category cannot be updated  ");

  res.status(200).send(category);
});

//DELETE CATEGORY
router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: "the Category is Deleted  ",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Category Not Found ",
        });
      }
    })
    .catch((error) => {
      return res.status(404).json({
        success: false,
        error: error,
      });
    });
});

module.exports = router;
