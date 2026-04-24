const Donation = require("../models/Donation");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { Types } = require("mongoose");

const populateDonation = (query) =>
  query.populate("donorId", "name email role").populate("NGOId", "name email role");

const formatUserRef = (value) => {
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

const formatDonation = (donation) => ({
  id: donation._id.toString(),
  donorId: formatUserRef(donation.donorId),
  NGOId: formatUserRef(donation.NGOId),
  type: donation.type,
  amount: donation.amount,
  itemDetails: donation.itemDetails,
  status: donation.status,
  createdAt: donation.createdAt,
});

const canAccessDonation = (donation, user) => {
  if (user.role === "admin") return true;
  if (user.role === "donor") return donation.donorId._id.equals(user._id);
  if (user.role === "ngo") return donation.NGOId._id.equals(user._id);
  return false;
};

const ensureValidObjectId = (value, fieldName) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}.`, 400);
  }
};

const createDonation = async (req, res, next) => {
  try {
    const { donorId, NGOId, type, amount, itemDetails } = req.body;

    if (!NGOId || !type) {
      return next(new AppError("NGOId and type are required.", 400));
    }

    if (!["money", "item"].includes(type)) {
      return next(new AppError("Donation type must be either money or item.", 400));
    }

    if (req.user.role === "ngo") {
      return next(new AppError("NGO accounts cannot create donations.", 403));
    }

    const resolvedDonorId = req.user.role === "admin" ? donorId : req.user._id;
    if (!resolvedDonorId) {
      return next(new AppError("A donorId is required for admin-created donations.", 400));
    }

    ensureValidObjectId(resolvedDonorId, "donorId");
    ensureValidObjectId(NGOId, "NGOId");

    const [donor, ngo] = await Promise.all([
      User.findById(resolvedDonorId),
      User.findById(NGOId),
    ]);

    if (!donor || donor.role !== "donor") {
      return next(new AppError("Valid donor account not found.", 404));
    }

    if (!ngo || ngo.role !== "ngo") {
      return next(new AppError("Valid NGO account not found.", 404));
    }

    const donation = await Donation.create({
      donorId: donor._id,
      NGOId: ngo._id,
      type,
      amount,
      itemDetails,
    });

    const populatedDonation = await populateDonation(Donation.findById(donation._id));

    sendSuccess(res, 201, "Donation created successfully.", {
      donation: formatDonation(populatedDonation),
    });
  } catch (err) {
    next(err);
  }
};

const getUserDonations = async (req, res, next) => {
  try {
    const requestedUserId = req.params.userId || req.user._id.toString();
    ensureValidObjectId(requestedUserId, "userId");

    const requestedUser = await User.findById(requestedUserId);
    if (!requestedUser) {
      return next(new AppError("User not found.", 404));
    }

    const isAdmin = req.user.role === "admin";
    const isOwnRecord = req.user._id.equals(requestedUser._id);

    if (!isAdmin && !isOwnRecord) {
      return next(new AppError("You do not have permission to view these donations.", 403));
    }

    let filter = {};
    if (requestedUser.role === "donor") {
      filter = { donorId: requestedUser._id };
    } else if (requestedUser.role === "ngo") {
      filter = { NGOId: requestedUser._id };
    } else if (requestedUser.role === "admin") {
      // Admin: return all donations
      filter = {};
    } else {
      return next(new AppError("Donations can only be fetched for donor or NGO accounts.", 400));
    }

    const donations = await populateDonation(
      Donation.find(filter).sort({ createdAt: -1 })
    );

    sendSuccess(res, 200, "Donations fetched successfully.", {
      user: {
        id: requestedUser._id,
        name: requestedUser.name,
        email: requestedUser.email,
        role: requestedUser.role,
      },
      donations: donations.map(formatDonation),
    });
  } catch (err) {
    next(err);
  }
};

const getMyDonations = async (req, res, next) => getUserDonations(req, res, next);

const getDonationById = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id, "donation ID");
    const donation = await populateDonation(Donation.findById(req.params.id));

    if (!donation) {
      return next(new AppError("Donation not found.", 404));
    }

    if (!canAccessDonation(donation, req.user)) {
      return next(new AppError("You do not have permission to view this donation.", 403));
    }

    sendSuccess(res, 200, "Donation fetched successfully.", {
      donation: formatDonation(donation),
    });
  } catch (err) {
    next(err);
  }
};

const updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["accepted", "delivered"].includes(status)) {
      return next(new AppError("Status must be accepted or delivered.", 400));
    }

    ensureValidObjectId(req.params.id, "donation ID");

    const donation = await populateDonation(Donation.findById(req.params.id));

    if (!donation) {
      return next(new AppError("Donation not found.", 404));
    }

    const isNgoOwner = req.user.role === "ngo" && donation.NGOId._id.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isNgoOwner && !isAdmin) {
      return next(new AppError("Only the assigned NGO or admin can update donation status.", 403));
    }

    if (status === "delivered" && donation.status !== "accepted") {
      return next(new AppError("Donation must be accepted before it can be delivered.", 400));
    }

    donation.status = status;
    await donation.save();

    sendSuccess(res, 200, "Donation status updated successfully.", {
      donation: formatDonation(donation),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDonation,
  getUserDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
};
