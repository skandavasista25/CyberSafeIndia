const express = require("express");
const { body } = require("express-validator");
const { getSecurityTips, createSecurityTip, updateSecurityTip, deleteSecurityTip } = require("../controllers/securityTipController");
const { protectAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const router = express.Router();

const tipValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

router.get("/", getSecurityTips);
router.post("/", protectAdmin, upload.single("image"), tipValidation, validate, createSecurityTip);
router.put("/:id", protectAdmin, upload.single("image"), updateSecurityTip);
router.delete("/:id", protectAdmin, deleteSecurityTip);

module.exports = router;
