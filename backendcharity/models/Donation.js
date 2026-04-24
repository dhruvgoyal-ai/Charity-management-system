const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Donor ID is required."],
  },
  NGOId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "NGO ID is required."],
  },
  type: {
    type: String,
    enum: ["money", "item"],
    required: [true, "Donation type is required."],
  },
  amount: {
    type: Number,
    min: [1, "Amount must be at least 1."],
    required: [
      function () {
        return this.type === "money";
      },
      "Amount is required for money donations.",
    ],
  },
  itemDetails: {
    type: String,
    trim: true,
    required: [
      function () {
        return this.type === "item";
      },
      "Item details are required for item donations.",
    ],
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "delivered"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
