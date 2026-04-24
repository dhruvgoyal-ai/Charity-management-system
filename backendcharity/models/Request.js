const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  NGOId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "NGO ID is required."],
  },
  title: {
    type: String,
    required: [true, "Title is required."],
    trim: true,
    minlength: [3, "Title must be at least 3 characters."],
    maxlength: [150, "Title cannot exceed 150 characters."],
  },
  description: {
    type: String,
    required: [true, "Description is required."],
    trim: true,
    minlength: [10, "Description must be at least 10 characters."],
    maxlength: [1000, "Description cannot exceed 1000 characters."],
  },
  category: {
    type: String,
    enum: ["food", "clothes", "money"],
    required: [true, "Category is required."],
  },
  urgencyLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    required: [true, "Urgency level is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
