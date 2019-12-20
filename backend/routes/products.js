const express = require("express");
const multer = require("multer");

const Product = require("../models/product");
const router = express.Router();

const IMG_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const isValid = IMG_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid Image Type");
    if (isValid) {
      error = null;
    }
    callback(error, "backend/images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = IMG_TYPE_MAP[file.mimetype];
    callback(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post("", multer({
  storage: storage
}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const product = new Product({
    title: req.body.title,
    imagePath: url + "/images/" + req.file.filename,
    descriptive: req.body.descriptive,
    price: Number(req.body.price),
    seller: req.body.seller
  });
  product.save().then(createdProduct => {
    res.status(201).json({
      message: "Product added successfully",
      product: {
        ...createdProduct,
        id: createdProduct._id,
      }
    });
  });
});

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const productQuery = Product.find();
  let fetchedProducts;
  if (pageSize && currentPage) {
    productQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  productQuery.then(documents => {
    fetchedProducts = documents
    return Product.countDocuments();
  }).then(count => {
    res.status(200).json({
      message: "Products fetched succesfully!",
      products: fetchedProducts,
      maxProducts: count
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

router.put("/:id", multer({
  storage: storage
}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const product = new Product({
    _id: req.body.id,
    title: req.body.title,
    imagePath: imagePath,
    descriptive: req.body.descriptive,
    price: Number(req.body.price),
    seller: req.body.seller
  });
  Product.updateOne({
      _id: req.params.id
    },
    product
  ).then(result => {
    console.log("Updating Product: " + req.params.id + result);
    res.status(200).json({
      message: "Product Updated!"
    });
  });
});

router.delete("/:id", (req, res, next) => {
  Product.deleteOne({
    _id: req.params.id
  }).then(result => {
    console.log("Deleting Product: " + req.params.id + result);
    res.status(200).json({
      message: "Product deleted!"
    });
  });
});

module.exports = router;
