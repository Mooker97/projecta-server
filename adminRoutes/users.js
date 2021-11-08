const { addUUID, getRequestBody } = require("../functions/translators.js");
const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  createAdminLogModel,
  getAllModel,
} = require("../models/index.js");
const { checkUUID } = require("../validation/index.js");

const {
  badRequestResponse,
  failedResponse,
  notAuthorisedResponse,
  respondWithDbResult,
  respondWithDbBoolean,
} = require("../responses/index.js");
const { kickIfNotAdminModel } = require("../adminModels/index.js");
const {
  encryptPassword,
  validateEditUser,
  validateRegister,
} = require("../validation/users.js");

const setAdminUserRoutes = (app) => {
  // get all users
  // check if admin
  // model
  // respond

  app.get("/admin/users", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      const allDataRes = await getAllModel("users");
      // dont send the passwords
      allDataRes.forEach((item) => {
        delete item.password;
      });
      respondWithDbResult(res, allDataRes);
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });

  // new group
  // check admin
  // validate data
  // model
  // log
  // respond

  app.post("/admin/users", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateRegister(input);
      if (input) {
        input = addUUID(input);
        input.password = encryptPassword(input.password);
        const itWorked = await baseCreateModel(input, "users");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "addgrp",
          req.socket.remoteAddress,
          isAdmin.uuid,
          input,
          itWorked
        );
      } else {
        badRequestResponse(res);
      }
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });

  // edit group
  // check admin
  // validate data
  // model
  // log
  // respond

  app.patch("/admin/users", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateEditUser(input);
      if (input) {
        input.password = encryptPassword(input.password);
        const itWorked = await baseEditModel(input, input.uuid, "users");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "updtgrp",
          req.socket.remoteAddress,
          isAdmin.uuid,
          input,
          itWorked
        );
      } else {
        badRequestResponse(res);
      }
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });

  // delete group
  // check admin
  // model
  // log
  // respond

  app.delete("/admin/users", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input.uuid = await checkUUID(input.uuid);
      if (input.uuid) {
        const itWorked = await baseDeleteModel(input.uuid, "users");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "delgrp",
          req.socket.remoteAddress,
          isAdmin.uuid,
          input,
          itWorked
        );
      } else {
        badRequestResponse(res);
      }
    } catch (err) {
      console.log(err);
      failedResponse(res);
    }
  });
};

module.exports = {setAdminUserRoutes};
