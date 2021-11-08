const {
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
} = require("./index.js");

const validateAddGroup = (input) => {
  try {
    let requiredKeys = ["groupName"];
    let acceptedKeys = ["groupName", "pinnedMessage", "imgLink"];

    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validGroupName(input.groupName)
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateEditGroup = (input) => {
  try {
    let requiredKeys = ["uuid"];
    let acceptedKeys = ["groupName", "pinnedMessage", "uuid"];
    let validName = true;
    if (input.groupName) {
      validName = validGroupName(input.groupName);
    }
    if (!checkInputHasKeys(input, requiredKeys) || !validName) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validGroupName = (name) => {
  if (
    name.length > 63 ||
    name.length < 4 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};
module.exports = { validateAddGroup, validateEditGroup };
