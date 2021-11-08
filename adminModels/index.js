const { getOneModel, getWhereModel } = require("../models/index.js"),
  { notAuthorisedResponse } = require("../responses/index.js"),
  { extractFromAdminToken } = require("../session/index.js");

// returns data or false if not admin
const checkIfAdminModel = async (token) => {
  // get the data out of the encrypted token
  token = extractFromAdminToken(token);
  // if not valid
  if (!token) {
    return false;
  }
  // gets the data of the admin with that uuid
  const adminData = await getAdminByUUIDModel(token.uuid);
  // if found
  if (adminData) {
    return adminData;
  }
  // else
  return false;
};

const getAdminByUUIDModel = async (uuid) => {
  let adminData = await getOneModel("admins", "uuid", uuid);
  if (adminData) {
    delete adminData.password;
    return adminData;
  }
  return false;
};

// send a not authorised if the user is not admin
// else send data
const kickIfNotAdminModel = async (req, res) => {
  const isAdmin = await checkIfAdminModel(req.headers["admin-auth"]);
  if (!isAdmin) {
    notAuthorisedResponse(res);
    return false;
  }
  return isAdmin;
};

// gets the data for an admin
const adminLoginInfoModel = async (input) => {
  let result = await getWhereModel(input.username, "admins", "username");
  try {
    return result[0];
  } catch {
    return false;
  }
};

module.exports = {
  adminLoginInfoModel,
  kickIfNotAdminModel,
  getAdminByUUIDModel,
  checkIfAdminModel,
};
