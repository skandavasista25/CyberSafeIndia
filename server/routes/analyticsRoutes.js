const express = require("express");
const { getAnalytics } = require("../controllers/analyticsController");
const { protectAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", protectAdmin, getAnalytics);

module.exports = router;
