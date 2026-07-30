const express = require("express");
const { toggleBookmark, getBookmarks, getHistory } = require("../controllers/userController");
const { protectUser } = require("../middleware/auth");

const router = express.Router();

router.use(protectUser);
router.get("/bookmarks", getBookmarks);
router.post("/bookmarks/:scamId", toggleBookmark);
router.get("/history", getHistory);

module.exports = router;
