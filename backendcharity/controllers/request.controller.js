const { Types } = require("mongoose");

const Request = require("../models/Request");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

const ensureValidObjectId = (value, fieldName) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
};

const formatNgoRef = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value._id) {
    return {
      id: value._id.toString(),
      name: value.name,
      email: value.email,
      role: value.role,
    };
  }
  return value;
};

const formatRequest = (request) => ({
  id: request._id.toString(),
  NGOId: formatNgoRef(request.NGOId),
  title: request.title,
  description: request.description,
  category: request.category,
  urgencyLevel: request.urgencyLevel,
  createdAt: request.createdAt,
});

const canManageRequest = (request, user) => {
  if (user.role === "admin") return true;
  if (user.role === "ngo") return request.NGOId._id.equals(user._id);
  return false;
};

const createRequest = async (req, res, next) => {
  try {
    if (!["ngo", "admin"].includes(req.user.role)) {
      return next(new AppError("Only NGO or admin accounts can create requests.", 403));
    }

    const { NGOId, title, description, category, urgencyLevel } = req.body;

    const resolvedNGOId = req.user.role === "admin" ? NGOId : req.user._id;
    if (!resolvedNGOId) {
      return next(new AppError("NGOId is required for admin-created requests.", 400));
    }

    ensureValidObjectId(resolvedNGOId, "NGOId");

    const ngo = await User.findById(resolvedNGOId);
    if (!ngo || ngo.role !== "ngo") {
      return next(new AppError("Valid NGO account not found.", 404));
    }

    const request = await Request.create({
      NGOId: resolvedNGOId,
      title,
      description,
      category,
      urgencyLevel,
    });

    const populatedRequest = await Request.findById(request._id).populate(
      "NGOId",
      "name email role"
    );

    sendSuccess(res, 201, "Request created successfully.", {
      request: formatRequest(populatedRequest),
    });
  } catch (err) {
    next(err);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find()
      .populate("NGOId", "name email role")
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, "Requests fetched successfully.", {
      requests: requests.map(formatRequest),
    });
  } catch (err) {
    next(err);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id, "request ID");

    const request = await Request.findById(req.params.id).populate(
      "NGOId",
      "name email role"
    );

    if (!request) {
      return next(new AppError("Request not found.", 404));
    }

    if (!canManageRequest(request, req.user)) {
      return next(new AppError("You do not have permission to update this request.", 403));
    }

    const allowedFields = ["title", "description", "category", "urgencyLevel"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        request[field] = req.body[field];
      }
    });

    await request.save();

    sendSuccess(res, 200, "Request updated successfully.", {
      request: formatRequest(request),
    });
  } catch (err) {
    next(err);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id, "request ID");

    const request = await Request.findById(req.params.id).populate(
      "NGOId",
      "name email role"
    );

    if (!request) {
      return next(new AppError("Request not found.", 404));
    }

    if (!canManageRequest(request, req.user)) {
      return next(new AppError("You do not have permission to delete this request.", 403));
    }

    await Request.deleteOne({ _id: request._id });

    sendSuccess(res, 200, "Request deleted successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  updateRequest,
  deleteRequest,
};
