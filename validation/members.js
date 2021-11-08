const {
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
} = require("./index.js");

// validate before creating invite
const validateAddInvite = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["userID", "groupID", "roleID"];
    let acceptedKeys = ["userID", "groupID", "roleID"];
    if (!checkInputHasKeys(input, requiredKeys)) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

// validate before creating invite
const validateAddMember = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["userID", "groupID", "roleID"];
    let acceptedKeys = ["userID", "groupID", "roleID"];
    if (!checkInputHasKeys(input, requiredKeys)) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

// validate before creating invite
const validateEditMember = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["roleID"];
    let acceptedKeys = ["roleID", "uuid"];
    if (!checkInputHasKeys(input, requiredKeys)) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

// validate before updating invite
const validateEditRole = (input) => {
  try {
    let requiredKeys = ["roleName", "uuid"];
    let acceptedKeys = ["roleName", "uuid"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validRoleName(input.roleName)
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

// validates the name of a role
const validRoleName = (name) => {
  if (
    name.length > 32 ||
    name.length < 3 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};
module.exports = {
  validateAddMember,
  validateAddInvite,
  validateEditRole,
  validateEditMember,
};
