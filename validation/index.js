const { validate } = require("uuid");
const uuidValidate = validate;

const checkUUID = async (input) => {
  if (uuidValidate(input)) {
    return input;
  }
  return false;
};

const checkTokenUUID = async (tokenData) => {
  if (tokenData.uuid == undefined) {
    return false;
  }
  return await checkUUID(tokenData.uuid);
};

// a function that checks the returns from database ( MYSQL obj )
// returns true if that it deems the response good
const checkDBReturn = (result) => {
  let toReturn = 200;
  if (result === undefined || result.length === 0) {
    // console.log("None Found");
    return 404;
  } else if (result === false) {
    // console.log("Query Failed");
    return 501;
  }
  return toReturn;
};

// checks that all the specified keys exist
const checkInputHasKeys = (input, keys) => {
  keys.forEach((key) => {
    if (input[key] === undefined) {
      return false;
    }
  });
  return true;
};

// creates a new object with only the specified keys
const extractInputKeys = (input, keys) => {
  if (!input) {
    return false;
  }
  let output = {};
  keys.forEach((key) => {
    if (input[key] !== undefined) {
      output[key] = input[key];
    }
  });
  return output;
};

// checks a regexp
const checkForChars = (str, pattern) => {
  pattern = new RegExp(pattern);
  const toReturn = pattern.test(str);
  return toReturn;
};

// creates a new object with only the specified keys and values
//  const checkEnumValues = (input, values) => {
//   if (!input) {
//     return false;
//   }
//   let output = {};
//   keys.forEach((key) => {
//     if (input[key] !== undefined) {
//       output[key] = input[key];
//     }
//   });
//   return output;
// };
module.exports = {
  checkUUID,
  checkForChars,
  checkInputHasKeys,
  extractInputKeys,
  checkTokenUUID,
  checkDBReturn,
};
