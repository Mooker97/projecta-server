// import the express app obj
const { signInAdmin } = require("../responses/users.js");
const { getRequestBody } = require("../functions/translators.js");
const { createAdminLogModel, getWhereModel } = require("../models/index.js");
const { checkDBReturn } = require("../validation/index.js");
const { validateLogin } = require("../validation/admins.js");

const {
  badRequestResponse,
  failedResponse,
  notAuthorisedResponse,
  respondWithDbResult,
} = require("../responses/index.js");
const {
  adminLoginInfoModel,
  kickIfNotAdminModel,
} = require("../adminModels/index.js");

const setAdminLoginRoutes = (app) => {
  // get a username and password from the client
  app.post("/admin/login", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      // check the input data is valid
      input = validateLogin(input);
      if (input) {
        // get info from model
        const adminData = await adminLoginInfoModel(input);
        const returnStatus = checkDBReturn(adminData);
        if (returnStatus === 200) {
          const loggedIn = await signInAdmin(adminData, input, res);
          if (loggedIn) {
            createAdminLogModel(
              "login",
              req.socket.remoteAddress,
              adminData.uuid
            );
          }
        } else {
          createAdminLogModel(
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

  // create a new admin
  app.get("/admin/me", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      const adminDataRes = await getWhereModel(isAdmin.uuid, "admins", "uuid");
      respondWithDbResult(res, adminDataRes);
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });
};

module.exports = {setAdminLoginRoutes};
