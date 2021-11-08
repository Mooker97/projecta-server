const { v4 } = require("uuid");

const fromSqlToJs = (result) => {
  // start with an empty array
  try {
    let response = [];
    result.forEach((row) => {
      // set the obecjt to the array
      response.push(row);
    });
    // switch to json and back to remove the RowDataPacket note from each row
    // This feels janky
    response = JSON.parse(JSON.stringify(response));
    return response;
  } catch {
    return false;
  }
};

//hellow

const compileBuffered = (input) => {
  try {
    input = Buffer.concat(input).toString();
    input = JSON.parse(input);
    return input;
  } catch (err) {
    console.log("---Bad JSON---");
    console.log(err);
    return null;
  }
};

const addUUID = (input) => {
  let output = input;
  output.uuid = v4();
  return output;
};

const extractFromObjs = (inputArr, key = "uuid") => {
  let returnArr = [];
  inputArr.forEach((item) => {
    returnArr.push(item[key]);
  });
  return returnArr;
};

const getRequestBody = async (req) => {
  return new Promise((resolve, reject) => {
    let input = [];
    req
      .on("data", (chunk) => {
        input.push(chunk);
      })
      // start the logic after the end of the request
      .on("end", () => {
        // compile the buffered chunks into a JS obj
        input = compileBuffered(input);
        if (input != null) {
          resolve(input);
        } else {
          resolve(false);
        }
      });
  });
};

module.exports = { getRequestBody, addUUID, fromSqlToJs, extractFromObjs };
