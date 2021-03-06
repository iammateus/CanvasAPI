const { validate } = require("../controllers/controller");
const PostAuthRegister = require("../validations/PostAuthRegister");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const create = async (req, res, next) => {
    const error = await validate(req.body, PostAuthRegister, res);
    if (error) {
        return error;
    }

    const user = new User(req.body);
    await user.save();
    res.status(StatusCodes.CREATED).json({
        message: "The user was created successfully",
    });
};

const me = (req, res, next) => {
    res.json({});
};

module.exports = { create, me };
