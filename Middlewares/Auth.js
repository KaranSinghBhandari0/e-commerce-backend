const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    const token = req.headers.token;

    if(!token) {
        return res.status(401).json({ msg: "login to continue" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = decoded.id === process.env.AdminID;

        if(result) {
            next();
        } else {
            return res.status(403).json({ msg: "Access denied - Admin only" });
        }
    } catch (error) {
        return res.status(403).json({ msg: "Access denied - Admin only" });
    }
};

const isLoggedIn = (req, res, next) => {
    const token = req.headers.token;

    if(!token) {
        return res.status(401).json({ msg: "login to continue" });
    } 
    next();
};

// function to find user
const findUser = (req) => {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id
}

module.exports = {isAdmin , isLoggedIn, findUser};
