const catchAsyncErrors = require("../catchAsyncErrors");
const User = require("../models/user");

// Register User
exports.register = catchAsyncErrors(async (req, res, next) => {
    try {
        const { userName, number, password } = req.body;
        const createdAt = new Date();
        createdAt.setHours(createdAt.getHours() + 5);
        createdAt.setMinutes(createdAt.getMinutes() + 30);
        const user = await User.create({
            userName,
            number,
            password,
            createdAt: createdAt,
        });
        res.status(201).send({
            success: true,
            message: "Registration successful",
            user,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Something went wrong Please contact Rohit",
        });
    }
});

// Login User
exports.login = catchAsyncErrors(async (req, res, next) => {
    const { userName, password } = req.body;
    // checking if user has given password and email both
    const user = await User.findOne({ userName }).select("+password");
    if (!user) {
        return res.status(401).send({
            success: false,
            massage: "Invalid email or password",
        });
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return res.status(401).send({
            success: false,
            massage: "Invalid email or password",
        });
    }
    const token = user.getJWTToken();
    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Login successfully",
        user,
        token,
    });
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});
