const catchAsyncErrors = require("../catchAsyncErrors");
const Sms = require("../models/sms");
const ErrorHandler = require("../ErrorHandler");

// Create Message
exports.newMessage = catchAsyncErrors(async (req, res, next) => {
    try {
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
        res.status(201).send({
            success: true,
            message: "New message Added",
            data: sms,
        });
    } catch (error) {
        res.status(500).send({
            success: false0,
            message: error,
        });
    }
});

// Get single user message
exports.getSingleUserMessage = catchAsyncErrors(async (req, res, next) => {
    try {
        const sms = await Sms.find({ user: req.user._id });
        let count = 0;

        sms.forEach((sms) => {
            count += 1;
        });

        res.status(200).json({
            success: true,
            message: `All message of ${req.user.userName}`,
            count,
            data: sms,
        });
    } catch (error) {
        res.status(200).json({
            success: false,
            message: `Something went wrong`,
        });
    }
});
// get all SMS -- Admin
exports.getAllMessage = catchAsyncErrors(async (req, res, next) => {
    try {
        const sms = await Sms.find();
        let count = 0;
        sms.forEach((sms) => {
            count += 1;
        });
        res.status(200).json({
            success: true,
            message: "All users message",
            totalSms: count,
            data: sms,
        });
    } catch (error) {
        res.status(200).json({
            success: false,
            message: "Something went wrong Please contact Rohit",
        });
    }
});
