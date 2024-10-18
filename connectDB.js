const mongoose = require('mongoose');

let connectDB = () => {
    // let DB_url = 'mongodb://127.0.0.1:27017/E-commerce';
    let DB_url = process.env.DB_URL;
    main()
        .then(() => {
            console.log("DB connection successful");
        })
        .catch((err) => console.log(err));
    
    async function main() {
        await mongoose.connect(DB_url);
    }
}

module.exports = connectDB;