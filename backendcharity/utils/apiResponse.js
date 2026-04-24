const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = "Internal Server Error") => {
  return res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    message,
  });
};

const sendPaginated = (res, statusCode = 200, message = "Success", data = [], pagination = {}) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    results: data.length,
    pagination,
    data,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
