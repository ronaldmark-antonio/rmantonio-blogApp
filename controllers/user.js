const bcrypt = require('bcrypt');
const User = require("../models/User");
const { errorHandler } = require("../auth");
const auth = require("../auth");

module.exports.registerUser = (req, res) => {

    if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: "Email invalid" });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters" });
    } else {
        let newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
            .then(user => res.status(201).send({ message: "Registered Successfully" }))
            .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {
    
    if (!req.body.email.includes("@")) {
        return res.status(400).send(false);
    }

    return User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: "No Email Found" });
            }

            const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
            if (isPasswordCorrect) {
                return res.status(200).send({ access: auth.createAccessToken(user) });
            } else {
                return res.status(401).send({ message: "Email and password do not match" });
            }
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.getProfile = (req, res) => {
    
    return User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }

            let { _id, email, __v } = user;
            res.send({ user: { _id, email, __v } });
        })
        .catch(error => errorHandler(error, req, res));
};
