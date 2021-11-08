const { signInJWT } = require("../session/index.js");
const {
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
} = require("./index.js");
const { encryptPassword, comparePassword } = require("./users.js");

const checkAdminCredentials = async (input, adminInfo) => {
  try {
    const goodPass = await comparePassword(input.password, adminInfo.password);
    if (goodPass && input.username === adminInfo.username) {
      const newTokenData = {
        uuid: adminInfo.uuid,
        username: adminInfo.username,
      };
      const token = signInJWT(newTokenData);
      return token;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

const validateRegisterAdmin = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["username", "password", "employeeNo"];
    let acceptedKeys = ["username", "password", "employeeNo"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validUserName(input.username) ||
      !validPassword(input.password)
    ) {
      return false;
    }
    input.password = encryptPassword(input.password);
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateLogin = (input) => {
  try {
    let requiredKeys = ["username", "password"];
    let acceptedKeys = ["username", "password"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validUserName ||
      !validPassword
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validUserName = (name) => {
  if (
    name.length > 62 ||
    name.length < 3 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};

const validPassword = (password) => {
  if (
    password.length > 63 ||
    password.length < 8 ||
    // (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
    // (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
    // (?=.*[0-9])	The string must contain at least 1 numeric character
    !checkForChars(password, "((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))")
  ) {
    return false;
  }
  return true;
};
module.exports = {
  checkAdminCredentials,
  validateLogin,
  validateRegisterAdmin,
};
