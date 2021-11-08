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
  validateAddMember,
  validateEditMember,
} = require("../validation/members.js");
const { getUserFromNameModel } = require("../models/users.js");

const setAdminMemberRoutes = (app) => {
  // get all members
  // check if admin
  // model
  // respond

  app.get("/admin/members", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      const allDataRes = await getAllModel("members");
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
  app.post("/admin/members", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      if (input.username) {
        const user = await getUserFromNameModel(input.username);
        if (user) {
          input.userID = user.uuid;
        } else {
          badRequestResponse(res);
          return;
        }
      }
      input = validateAddMember(input);
      if (input) {
        input = addUUID(input);
        const itWorked = await baseCreateModel(input, "members");
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

  app.patch("/admin/members", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateEditMember(input);
      if (input) {
        const itWorked = await baseEditModel(input, input.uuid, "members");
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

  app.delete("/admin/members", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);

        return;
      }
      input.uuid = await checkUUID(input.uuid);
      if (input.uuid) {
        const itWorked = await baseDeleteModel(input.uuid, "members");
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

module.exports = { setAdminMemberRoutes };
