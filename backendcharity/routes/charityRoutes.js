const express = require("express");
const router = express.Router();
const { sendSuccess } = require("../utils/apiResponse");
const { protect }      = require("../middleware/authMiddleware");
const { restrictTo }   = require("../middleware/roleMiddleware");

// @route  GET  /api/v1/charities  — public
router.get("/", (req, res) => {
  sendSuccess(res, 200, "Get all charities — connect your charityController here");
});

// @route  GET  /api/v1/charities/:id  — public
router.get("/:id", (req, res) => {
  sendSuccess(res, 200, `Get charity ${req.params.id}`);
});

// @route  POST /api/v1/charities  — admin only
router.post("/", protect, restrictTo("admin"), (req, res) => {
  sendSuccess(res, 201, "Create charity — connect your charityController here");
});

// @route  PUT  /api/v1/charities/:id  — admin only
router.put("/:id", protect, restrictTo("admin"), (req, res) => {
  sendSuccess(res, 200, `Update charity ${req.params.id}`);
});

// @route  DELETE /api/v1/charities/:id  — admin only
router.delete("/:id", protect, restrictTo("admin"), (req, res) => {
  sendSuccess(res, 200, `Delete charity ${req.params.id}`);
});

module.exports = router;
