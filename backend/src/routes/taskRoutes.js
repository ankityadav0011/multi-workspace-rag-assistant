const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { listTasks } = require("../controllers/taskController");

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", asyncHandler(listTasks));

module.exports = router;