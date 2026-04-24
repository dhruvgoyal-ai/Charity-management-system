const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createRequest,
  getAllRequests,
  updateRequest,
  deleteRequest,
} = require("../controllers/request.controller");

router.get("/", getAllRequests);
router.post("/", protect, createRequest);
router.put("/:id", protect, updateRequest);
router.delete("/:id", protect, deleteRequest);

module.exports = router;
