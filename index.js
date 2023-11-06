const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Products = require("./Models/ProductSchema");
const User = require("./models/UserSchema");
require("dotenv").config();
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

const PORT = process.env.PORT;
const SALT_ROUNDS = 12;

// POST - Register User
app.post("/register", async (req, res) => {
    const userBody = req.body;

    const hashedPassword = await bcrypt.hash(userBody.password, SALT_ROUNDS);

    const userObj = new User({
        name: userBody.name,
        username: userBody.username,
        password: hashedPassword,
        email: userBody.email,
        userType: userBody.userType,
    });

    try {
        await userObj.save();

        res.status(201).send({
            status: 201,
            message: "User registered successfully!",
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to register user!",
            data: err,
        });
    }
});

// POST - Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let userData;

    try {
        userData = await User.findOne({ username });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "User fetching failed!",
            data: err,
        });
    }

    let isPasswordSame = await bcrypt.compare(password, userData.password);

    if (!isPasswordSame) {
        return res.status(400).send({
            status: 400,
            message: "Password is incorrect!",
        });
    } else {
        let payload = {
            name: userData.name,
            username: userData.username,
            email: userData.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

        res.status(200).send({
            status: 200,
            message: "Successfully logged in!",
            data: {
                token, userData
            },
        });
    }
});

// POST - Create a Product
app.post("/addproduct", async (req, res) => {
    const { catgory, productAddBy, price, productName, subcatgory } = req.body;

    if (
        productName?.length == 0 ||
        productAddBy?.length == 0 ||
        catgory?.length == 0 || subcatgory?.length == 0
    ) {
        return res.status(400).send({
            status: 400,
            message: "Please enter the values in correct format!",
        });
    }

    try {
        const ProdctObj = new Products({
            productName,
            price,
            catgory,
            dateTime: new Date(),
            productAddBy,
            subcatgory,
        });

        await ProdctObj.save();

        res.status(201).send({
            status: 201,
            message: "Prodct Add successfully!",
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Product Not Added",
            data: err,
        });
    }
});

// GET - GET Product for Merchant
app.get("/products/:username", async (req, res) => {
    const username = req.params.username;

    try {
        const productList = await Products.find({ productAddBy: username })

        res.status(200).send({
            status: 200,
            message: "Fetched all Products for a username successfully!",
            data: productList,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to fetch all Poducts for a username!",
            data: err,
        });
    }
});
//GET : GET All Products
app.get("/allproducts", async (req, res) => {
    try {
        const productList = await Products.find({}); // This will retrieve all products

        res.status(200).send({
            status: 200,
            message: "Fetched all products successfully!",
            data: productList,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to fetch all products!",
            data: err,
        });
    }
});
//GET : GET Prodcut for User based on filter
app.get("/filteredproducts", async (req, res) => {
    const { catgory, priceSort, sortOrder, subcatgory } = req.query;

    try {
        let filter = {};

        if (catgory) {
            filter.catgory = catgory;
        }

        if (subcatgory) {
            filter.subcatgory = subcatgory;
        }

        let sortOption = {};

        if (priceSort) {
            if (sortOrder === "ascending") {
                sortOption.price = 1;
            } else if (sortOrder === "descending") {
                sortOption.price = -1;
            }
        }

        const productList = await Products.find(filter).sort(sortOption);

        res.status(200).send({
            status: 200,
            message: "Fetched all Products based on filters successfully!",
            data: productList,
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to fetch Products based on filters!",
            data: err,
        });
    }
});

// PATCH - Update Product
app.patch("/updateproduct", async (req, res) => {
    const { id, catgory, price, productName, subcatgory } = req.body;

    try {
        await Products.findByIdAndUpdate(id, { productName, price, catgory, subcatgory });

        res.status(200).send({
            status: 200,
            message: "Updated a Product successfully!",
        });
    } catch (err) {
        res.status(400).send({
            status: 400,
            message: "Failed to update Product id!",
            data: err,
        });
    }
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB is connected!"))
    .catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log("Server is running at:", PORT);
});
