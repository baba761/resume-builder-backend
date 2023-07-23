const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema(
    {
        number: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        msg: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
        },
        createdAt: {
            type: mongoose.Schema.Types.Date,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);
module.exports = mongoose.model("sms", smsSchema);
