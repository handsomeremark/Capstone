const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
const mongoUri = process.env.ATLAS_URI;
if (!mongoUri) {
    console.error('MongoDB connection string (ATLAS_URI) is not defined.');
    process.exit(1);
}

// Mongoose connection
mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to MongoDB');
        const db = mongoose.connection.db;
        console.log('Database Name:', db.databaseName);
    })
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Schemas
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: String,
    image: String,
    category: { type: String, enum: ['Fruits', 'Vegetables', 'Spices'], required: true },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
});

const profileSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    profileImage: { type: String, default: null }, 
});

// Models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Product = mongoose.model('Product', productSchema);

// Multer setup for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add Product Endpoint with Base64 image
app.post('/add-product', upload.single('image'), async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);

    const { name, price, description, category } = req.body;

    if (isNaN(price) || price < 0 || !Number.isInteger(parseFloat(price))) {
        return res.status(400).json({ message: "Invalid input: 'price' should be a non-negative integer." });
    }

    try {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            console.log('Product already exists');
            return res.status(400).json({ message: "Product with this name already exists." });
        }

        const product = new Product({
            name,
            price: parseInt(price, 10),
            description,
            category,
            image: req.file ? req.file.buffer.toString('base64') : null
        });

        await product.save();
        res.status(201).json({ message: "Product added successfully." });
    } catch (error) {
        console.error('Error saving product:', error.message); 
        res.status(500).json({ message: "Error saving product.", error: error.message });
    }
});

// Update Product Endpoint
app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category } = req.body;

        if (isNaN(price) || !Number.isInteger(parseFloat(price))) {
            return res.status(400).json({ message: "Invalid input: 'price' should be an integer." });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { name, price: parseInt(price, 10), description, category }, 
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: "Error updating product.", error });
    }
});

// Get All Products Endpoint
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: "Error fetching products.", error });
    }
});

// Delete Product Endpoint
app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Product.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: "Error deleting product.", error });
    }
});

// Get All Profiles Endpoint
app.get('/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: "Error fetching profiles.", error });
    }
});

// Add Profile Endpoint
app.post('/profiles', async (req, res) => {
    const { firstName, lastName, gender, address } = req.body;
    try {
        const newProfile = new Profile({ firstName, lastName, gender, address });
        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (error) {
        console.error('Error adding profile:', error);
        res.status(500).json({ message: "Error adding profile.", error });
    }
});

// Delete Profile Endpoint
app.delete('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Profile.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: "Profile not found." });
        }
        res.json({ message: "Profile deleted successfully." });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: "Error deleting profile.", error });
    }
});

// Dashboard Endpoints
app.get('/total-users', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ total: userCount });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ message: "Error fetching user count.", error });
    }
});

app.get('/total-products', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        res.json({ total: totalProducts });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
