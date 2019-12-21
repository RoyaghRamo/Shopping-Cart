const mongoose = require("mongoose");
const shortid = require("shortid");

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  descriptive: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seller: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Product", productSchema);
