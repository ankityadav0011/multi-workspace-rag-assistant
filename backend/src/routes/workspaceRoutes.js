const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { listWorkspaces, createWorkspace } = require("../controllers/workspaceController");

const router = express.Router();

router.use(requireAuth);
router.get("/", asyncHandler(listWorkspaces));
router.post("/", asyncHandler(createWorkspace));

module.exports = router;
