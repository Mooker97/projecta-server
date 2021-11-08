const {
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
} = require("./index.js");
const validateAddTask = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["taskName", "parentID"];
    let acceptedKeys = ["taskName", "parentID"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validTaskName(input.taskName)
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};
const validateEditTask = (input) => {
  try {
    let requiredKeys = ["uuid"];
    let acceptedKeys = ["taskName", "completed", "uuid"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      (input.taskName !== undefined && !validTaskName(input.taskName))
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validTaskName = (name) => {
  if (
    name.length > 62 ||
    name.length < 3 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};
module.exports = { validateEditTask, validateAddTask };
