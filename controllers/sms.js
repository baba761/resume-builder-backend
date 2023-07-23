const catchAsyncErrors = require("../catchAsyncErrors");
const Sms = require("../models/sms");
const ErrorHandler = require("../ErrorHandler");

// Create Message
exports.newMessage = catchAsyncErrors(async (req, res, next) => {
    const { name, number, msg, description, type } = req.body;
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() + 5);
    createdAt.setMinutes(createdAt.getMinutes() + 30);
    const sms = await Sms.create({
        name,
        number,
        msg,
        description,
        type,
        createdAt: createdAt,
        user: req.user._id,
    });
    res.status(201).send(sms);
});

// Get single user message
exports.getSingleUserMessage = catchAsyncErrors(async (req, res, next) => {
    const sms = await Sms.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        sms,
    });
});
// get all SMS -- Admin
exports.getAllMessage = catchAsyncErrors(async (req, res, next) => {
    const sms = await Sms.find();

    let count = 0;

    sms.forEach((sms) => {
        count += 1;
    });

    res.status(200).json({
        success: true,
        totalSms: count,
        sms,
    });
});
