const express = require("express");

const Product = require("../models/product");
const router = express.Router();

router.post("", (req, res, next) => {
  const product = new Product({
    title: req.body.title,
    descriptive: req.body.descriptive,
    price: req.body.price,
    seller: req.body.seller
  });
  product.save().then(createdProduct => {
    res.status(201).json({
      message: "Product added successfully",
      productId: createdProduct._id
    });
  });
});

router.get("", (req, res, next) => {
  Product.find().then(products => {
    res.status(200).json({
      message: "Products fetched succesfully!",
      products: products
    });
  });
});

router.get("/:id", (req, res, next) => {
  Product.findById(req.params.id).then(product => {
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        message: "Product not found!"
      });
    }
  });
});

router.put("/:id", (req, res, next) => {
  const product = new Product({
    _id: req.body.id,
    title: req.body.title,
    descriptive: req.body.descriptive,
    price: req.body.price,
    seller: req.body.seller
  });
  Product.updateOne({
      _id: req.params.id
    },
    product
  ).then(result => {
    res.status(200).json({
      message: "Product Updated!"
    });
  });
});

router.delete("/:id", (req, res, next) => {
  Product.deleteOne({
    _id: req.params.id
  }).then(result => {
    console.log(result);
    res.status(200).json({
      message: "Product deleted!"
    });
  });
});

module.exports = router;
