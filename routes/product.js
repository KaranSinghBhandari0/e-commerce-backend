const express = require('express');
const router = express.Router({ mergeParams: true });
const Product = require('../models/product');
const cloudinary = require('../cloudConfig');
const multer = require('multer');
const {isAdmin} = require('../Middlewares/Auth');
const path = require("path");

// Multer config
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      let ext = path.extname(file.originalname);  
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
        cb(new Error("File type is not supported"), false);
        return;
      }
      cb(null, true);
    },
});

// generate random products 
router.get('/random', async (req, res) => {
    try {
      // Fetch random products (let's say 8 products)
      const randomProducts = await Product.aggregate([{ $sample: { size: 8 } }]);
  
      res.status(200).json({ message: 'Random products fetched successfully', products: randomProducts });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err });
    }
});

// get products by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;

    try {
        const products = await Product.find({ category });
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }
        res.status(200).json({ message: 'Products fetched successfully', products });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// get product by id
router.get('/:id', async (req,res)=> {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'No product found' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
})

// create new Product
router.post('/new', isAdmin, upload.single('image'), async (req,res)=> {
    try {
		const { name, description, price, category } = req.body;
        const result = await cloudinary.uploader.upload(req.file.path);

        const newProduct = new Product({
            name,
            description,
			price,
			category,
            image: result.secure_url,
            cloudinary_id: result.public_id,
        });
        await newProduct.save();

		res.status(200).json({message: 'Product saved' , product: newProduct});
	} catch (error) {
		console.log("Error in createProduct", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
})

// Update product
router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.file) {
            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(product.cloudinary_id);

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path);
            product.image = result.secure_url;
            product.cloudinary_id = result.public_id;
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;

        await product.save();

        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// delete product
router.delete('/:id', isAdmin , async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(product.cloudinary_id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err });
    }
});

module.exports = router;
