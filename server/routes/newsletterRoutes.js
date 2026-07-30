const express = require("express");
const { body } = require("express-validator");
const { subscribe, getSubscribers, deleteSubscriber } = require("../controllers/newsletterController");
const { protectAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/", [body("email").isEmail().withMessage("A valid email is required").normalizeEmail()], validate, subscribe);
router.get("/", protectAdmin, getSubscribers);
router.delete("/:id", protectAdmin, deleteSubscriber);

module.exports = router;
