require('dotenv').config();
const express = require('express');
const connectDB = require('./connectDB');
const cors = require('cors');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	cors({
	  origin: ["https://e-commerce-three-taupe.vercel.app"]
	})
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("Listening on port " + PORT);
	connectDB();
});

app.get('/', (req, res) => {
    res.send('this is root');
});

// account routes
app.use("/user", require('./routes/user'));

// auth routes
app.use("/auth", require('./routes/auth'));

// product routes
app.use("/products", require('./routes/product'));

// cart routes
app.use("/cart", require('./routes/cart'));

// payment routes
app.use('/payment', require('./routes/paymentRoutes'));