const {
  checkUserCredentials,
  checkAdminCredentials,
} = require("../validation/users.js");
const { failedResponse, successResponse } = require("./index.js");

// check if the user is good
// send the token in a response
const signInUser = async (userInfo, input, res) => {
  const userTokenData = await checkUserCredentials(input, userInfo);
  if (userTokenData) {
    successResponse(res, { message: "Signed In" }, 200, {
      "content-type": "application/json",
      "X-auth": userTokenData,
    });
    return true;
  } else {
    failedResponse(res, { message: "Sign In Failed" }, 400);
    return false;
  }
};

const signInAdmin = async (adminInfo, input, res) => {
  const adminToken = await checkAdminCredentials(input, adminInfo);
  if (adminToken) {
    successResponse(res, { message: "Signed In" }, 200, {
      "content-type": "application/json",
      "X-auth": adminToken,
    });
    return true;
  } else {
    failedResponse(res, { message: "Sign In Failed" }, 400);
    return false;
  }
};
module.exports = { signInAdmin, signInUser };
