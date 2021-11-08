const successResponse = (
  res,
  data = { message: "Good Result" },
  statusCode = 200,
  header = { "content-type": "application/json" }
) => {
  res.statusCode = statusCode;
  res.set(header);
  res.end(JSON.stringify(data));
};

const failedResponse = (
  res,
  data = { message: "Server Error" },
  statusCode = 500,
  header = { "content-type": "application/json" }
) => {
  res.statusCode = statusCode;
  res.set(header);
  res.end(JSON.stringify(data));
};

const emptyResponse = (
  res,
  statusCode = 204,
  header = { "content-type": "application/json" }
) => {
  res.statusCode = statusCode;
  res.set(header);
  res.end();
};

const badRequestResponse = (
  res,
  data = { message: "Bad Request or Invalid Data" },
  statusCode = 400,
  header = { "content-type": "application/json" }
) => {
  res.statusCode = statusCode;
  res.set(header);
  res.end(JSON.stringify(data));
};

const notAuthorisedResponse = (
  res,
  data = { message: "Not Authorised for that action" },
  statusCode = 401,
  header = { "content-type": "application/json" }
) => {
  res.statusCode = statusCode;
  res.set(header);
  res.end(JSON.stringify(data));
};

// check the data to be returned to the user and determine the correct response type
const respondWithDbResult = (res, result) => {
  if (result === undefined || result.length === 0 || result === {}) {
    emptyResponse(res);
    return false;
  } else if (result === false) {
    failedResponse(res);
    return false;
  }
  successResponse(res, result);
  return true;
};

// check the result boolean send either success or failed, with the option to include input values
const respondWithDbBoolean = (res, result, input = {}) => {
  if (!result) {
    input = { message: "Action Failed", ...input };
    badRequestResponse(res, input);
    return false;
  }
  input = { message: "Action Success", ...input };
  successResponse(res, input);
  return true;
};
module.exports = {
  successResponse,
  emptyResponse,
  failedResponse,
  respondWithDbBoolean,
  respondWithDbResult,
  notAuthorisedResponse,
  badRequestResponse,
};
