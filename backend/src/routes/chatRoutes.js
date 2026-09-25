const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { listMessages, askQuestion } = require("../controllers/chatController");

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", asyncHandler(listMessages));
router.post("/", asyncHandler(askQuestion));

module.exports = router;