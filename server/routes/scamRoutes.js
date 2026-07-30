const express = require("express");
const { body } = require("express-validator");
const { getScams, getScamById, createScam, updateScam, deleteScam } = require("../controllers/scamController");
const { protectAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

const router = express.Router();

const scamValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("howItWorks").trim().notEmpty().withMessage("How It Works is required"),
];

router.get("/", getScams);
router.get("/:id", getScamById);
router.post("/", protectAdmin, upload.single("image"), scamValidation, validate, createScam);
router.put("/:id", protectAdmin, upload.single("image"), updateScam);
router.delete("/:id", protectAdmin, deleteScam);

module.exports = router;
