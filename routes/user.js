const express = require("express");

const { logout, register, login } = require("../controllers/user");

const router = express.Router();

router.route("/user/logout").get(logout);
router.route("/user/register").post(register);
router.route("/user/login").post(login);

module.exports = router;
