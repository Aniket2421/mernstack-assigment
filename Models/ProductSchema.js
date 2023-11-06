const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Products = new Schema({
    productName: {
        type: String,
        require: true,
    },
    price: {
        type: String,
        require: true,
    },
    subcatgory: {
        type: String,
        require: true,
    },
    dateTime: {
        type: Date,
        require: true,
        default: new Date(),
    },
    productAddBy: {
        type: String,
        require: true,
    },
    catgory: {
        type: String,
        require: true,
    },

});

module.exports = mongoose.model("product", Products);