const express = require("express");
const {
    newMessage,
    getSingleUserMessage,
    getAllMessage,
} = require("../controllers/sms");
const { isAuthenticatedUser, authorizeRoles } = require("../auth");
const router = express.Router();

router
    .route("/sms")
    .post(isAuthenticatedUser, newMessage)
    .get(isAuthenticatedUser, getSingleUserMessage);

router
    .route("/admin/sms")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllMessage);

module.exports = router;
