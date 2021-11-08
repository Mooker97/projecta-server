const bcrypt = require("bcrypt");
const { signInJWT, signInJWTAdmin } = require("../session/index.js");
const {
  checkForChars,
  checkInputHasKeys,
  checkUUID,
  extractInputKeys,
} = require("./index.js");

const encryptPassword = (password) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return hashedPassword;
  } catch {
    return false;
  }
};

const comparePassword = async (input, stored) => {
  const result = await bcrypt.compare(input, stored);
  return result;
};

const checkUserCredentials = async (input, userInfo) => {
  try {
    console.log(input.password);
    const goodPass = await comparePassword(input.password, userInfo.password);
    if (goodPass && input.username === userInfo.username) {
      const newTokenData = {
        uuid: userInfo.uuid,
        username: userInfo.username,
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

const checkAdminCredentials = async (input, userInfo) => {
  try {
    const goodPass = await comparePassword(input.password, userInfo.password);
    if (goodPass && input.username === userInfo.username) {
      const newTokenData = {
        uuid: userInfo.uuid,
        username: userInfo.username,
      };
      const token = signInJWTAdmin(newTokenData);
      return token;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

const validateRegister = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["username", "password", "email"];
    let acceptedKeys = ["username", "password", "email", "alias"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validUserName(input.username) ||
      !validPassword(input.password) ||
      !validEmail(input.email)
    ) {
      return false;
    }
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
    if (!checkInputHasKeys(input, requiredKeys)) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateEditUser = (input) => {
  try {
    let acceptedKeys = ["username", "password", "email", "uuid"];
    if (input.username !== undefined && !validUserName(input.username)) {
      return false;
    }
    if (input.email !== undefined && !validEmail(input.email)) {
      return false;
    }
    if (input.password !== undefined && !validPassword(input.password)) {
      return false;
    }
    if (!checkUUID(input.uuid)) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateEditPreferences = (input) => {
  try {
    let acceptedKeys = ["darkMode", "fontSize"];
    let output = extractInputKeys(input, acceptedKeys);
    // let acceptedVals = { row1: ["Val1", "Val2"] };
    // output = checkEnumValues(input, acceptedVals);
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

const validEmail = (name) => {
  if (
    name.length > 63 ||
    name.length < 4 ||
    // thanks stack overflow
    !checkForChars(name, "(.+)@(.+){2,}.(.+){2,}")
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
  validateLogin,
  validateEditUser,
  validateEditPreferences,
  encryptPassword,
  checkAdminCredentials,
  checkUserCredentials,
  validateRegister,
};
