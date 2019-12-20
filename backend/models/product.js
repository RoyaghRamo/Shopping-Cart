const mongoose = require('mongoose');
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
  // sku stands for Stock Keeping Unit
  // It's a number assigned to a product by a retail store
  // to identify the price, product options....
  // sku: {
  //   type: String,
  //   unique: true,
  //   default: shortid.generate()
  // },
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

module.exports = mongoose.model('Product', productSchema);
