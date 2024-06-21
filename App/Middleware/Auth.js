const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            msg: "No token provided!"
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                msg: "Unauthorized!"
            });
        }

        req.body.adminId = decoded.id;
        next();
    });
};

module.exports = authenticateToken