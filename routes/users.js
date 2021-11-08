//  the express app obj
const { signInUser } = require("../responses/users.js"),
  { addUUID, getRequestBody } = require("../functions/translators.js"),
  {
    createUserModel,
    deleteUserModel,
    editUserModel,
    getLoginInfoModel,
    getUserModel,
    getPreferenceModel,
    editPreferenceModel,
  } = require("../models/users.js"),
  { createLogModel } = require("../models/index.js"),
  {
    checkDBReturn,

    checkUUID,
  } = require("../validation/index.js"),
  {
    encryptPassword,
    validateEditUser,
    validateLogin,
    validateRegister,
    validateEditPreferences,
  } = require("../validation/users.js"),
  { extractFromToken } = require("../session/index.js"),
  {
    badRequestResponse,
    failedResponse,
    notAuthorisedResponse,
    successResponse,
    respondWithDbResult,
    respondWithDbBoolean,
  } = require("../responses/index.js");

const setUserRoutes = (app) => {
  // get a username and password from the client
  app.post("/login", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      // check the input data is valid
      input = validateLogin(input);
      if (input) {
        // get info from model
        const userData = await getLoginInfoModel(input);
        // check the result from the DB
        // console.log(userData);
        const returnStatus = checkDBReturn(userData);
        if (returnStatus === 200) {
          const loggedIn = await signInUser(userData, input, res);
          if (loggedIn) {
            createLogModel("login", req.socket.remoteAddress, userData.uuid);
          }
        } else {
          createLogModel(
            "login",
            req.socket.remoteAddress,
            null,
            { inputUsername: input.username },
            0
          );
          badRequestResponse(res, {
            message: "Sign in failed, Check username and password.",
          });
        }
      } else {
        badRequestResponse(res);
      }
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });

  // get user info from client, encrypt the password
  app.post("/register", async (req, res) => {
    let input = await getRequestBody(req);
    // validate inputs
    input = validateRegister(input);
    if (input) {
      input = addUUID(input);
      input.password = encryptPassword(input.password);
      const didMake = await createUserModel(input);
      delete input.password;
      const goodresult = respondWithDbBoolean(res, didMake, input);
      createLogModel(
        "register",
        req.socket.remoteAddress,
        null,
        input,
        goodresult
      );
    } else {
      badRequestResponse(res);
    }
  });

  // edit existing by id
  app.patch("/users", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input = validateEditUser(input);
    if (input) {
      const didEdit = await editUserModel(input, tokenData.uuid);
      const goodresult = respondWithDbBoolean(res, didEdit, input);
      createLogModel(
        "updtusr",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        goodresult
      );
    } else {
      badRequestResponse(res);
    }
  });

  // check the user id is same as requested user for deleting
  // call delete model
  // send response
  app.delete("/users", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    const input = await getRequestBody(req);
    if (tokenData.uuid === input.uuid) {
      const didDelete = await deleteUserModel(tokenData.uuid);
      const goodresult = respondWithDbBoolean(res, didDelete, input);
      createLogModel(
        "delusr",
        req.socket.remoteAddress,
        null,
        input,
        goodresult
      );
    } else {
      notAuthorisedResponse(res);
    }
  });

  // Get One
  app.get("/users", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (checkUUID(input.uuid)) {
      let userData = await getUserModel(input.uuid);
      delete userData["email"];
      respondWithDbResult(res, userData);
    } else {
      badRequestResponse(res);
    }
  });

  // Get Signed in
  app.get("/me", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!tokenData) {
      notAuthorisedResponse(res);
      return;
    }
    const userData = await getUserModel(tokenData.uuid);
    respondWithDbResult(res, userData);
  });

  // Get My Preferences
  app.get("/mypref", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (checkUUID(tokenData.uuid)) {
      const userPreferences = await getPreferenceModel(tokenData.uuid);
      respondWithDbResult(res, userPreferences);
    } else {
      notAuthorisedResponse(res);
    }
  });

  // Edit My preferences
  app.patch("/mypref", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!tokenData) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input = validateEditPreferences(input);
    if (input) {
      const didEdit = await editPreferenceModel(input, tokenData.uuid);
      respondWithDbBoolean(res, didEdit, input);
    } else {
      badRequestResponse(res);
    }
  });

  // get preferences
  // updt pref
};

module.exports = {setUserRoutes};
