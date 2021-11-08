const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  db,
  getWhereModel,
} = require("./index.js");

// add User
const createUserModel = async (input) => {
  return await baseCreateModel(input, "users");
};

// Edit User
const editUserModel = async (input, id) => {
  return await baseEditModel(input, id, "users");
};

// delete User
const deleteUserModel = async (id) => {
  return await baseDeleteModel(id, "users");
};

// checks for a username in the database
const getLoginInfoModel = async (input) => {
  let result = await getWhereModel(input.username, "users", "username");
  try {
    return result[0];
  } catch {
    return false;
  }
};

const getUserModel = async (userID) => {
  let result = await getWhereModel(userID, "users", "uuid");
  try {
    delete result[0]["password"];
    return result[0];
  } catch {
    return false;
  }
};

const getUserFromNameModel = async (userName) => {
  let result = await getWhereModel(userName, "users", "userName");
  try {
    delete result[0]["password"];
    return result[0];
  } catch {
    return false;
  }
};

const getPreferenceModel = async (userID) => {
  let result = await getWhereModel(userID, "user_preferences", "userID");
  try {
    return result[0];
  } catch {
    return false;
  }
};

const editPreferenceModel = async (input, id) => {
  return await baseEditModel(input, id, "user_preferences", "userID");
};
module.exports = {
  createUserModel,
  editUserModel,
  deleteUserModel,
  getLoginInfoModel,
  getUserFromNameModel,
  getUserModel,
  getPreferenceModel,
  editPreferenceModel,
};
