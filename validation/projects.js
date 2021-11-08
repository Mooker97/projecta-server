const { checkForChars, checkInputHasKeys, extractInputKeys } = require( "./index.js");

 const validateAddProject = (input) => {
  // validate name , password
  try {
    let requiredKeys = ["projectName", "parentID"];
    let acceptedKeys = ["projectName", "parentID"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      !validProjectName(input.projectName)
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

 const validateEditProject = (input) => {
  try {
    let requiredKeys = ["uuid"];
    let acceptedKeys = ["projectName", "uuid"];
    if (
      !checkInputHasKeys(input, requiredKeys) ||
      (input.projectName !== undefined && !validProjectName(input.projectName))
    ) {
      return false;
    }
    const output = extractInputKeys(input, acceptedKeys);
    return output;
  } catch {
    return false;
  }
};

const validProjectName = (name) => {
  if (
    name.length > 62 ||
    name.length < 3 ||
    checkForChars(name, `;|\`|\n|\r`)
  ) {
    return false;
  }
  return true;
};
module.exports = {validateEditProject , validateAddProject}