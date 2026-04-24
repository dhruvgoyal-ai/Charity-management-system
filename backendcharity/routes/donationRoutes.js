const express = require("express");
const router = express.Router();
 
const { protect } = require("../middleware/authMiddleware");
const {
  createDonation,
  getUserDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
} = require("../controllers/donation.controller");
 
router.use(protect);
 
router.post("/",               createDonation);
router.get("/my",              getMyDonations);
router.get("/user/:userId",    getUserDonations);
router.patch("/:id/status",    updateDonationStatus);
router.get("/:id",             getDonationById);
 
module.exports = router;

