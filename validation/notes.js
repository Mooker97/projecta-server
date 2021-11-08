const {
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
} = require("./index.js");

const validateAddNote = (input) => {
  try {
    // validate name , password
    let requiredKeys = ["noteName", "parentID", "type"];
    let acceptedKeys = ["noteName", "parentID", "type"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validNoteName(input.noteName)
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateEditNote = (input) => {
  try {
    let requiredKeys = ["uuid", "type"];
    let acceptedKeys = ["noteName", "uuid", "type"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      (input.noteName !== undefined && !validNoteName(input.noteName))
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validateGetNote = (input) => {
  try {
    let requiredKeys = ["uuid", "type"];
    let acceptedKeys = ["noteName", "uuid", "type"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      (input.noteName !== undefined && !validNoteName(input.noteName))
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validNoteName = (name) => {
  if (
    name.length > 62 ||
    name.length < 3 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};
module.exports = { validateAddNote, validateEditNote, validateGetNote };
