const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { listToolLogs } = require("../controllers/toolLogController");

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", asyncHandler(listToolLogs));

module.exports = router;