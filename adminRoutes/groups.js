const { addUUID, getRequestBody } = require("../functions/translators.js"),
  {
    baseCreateModel,
    baseDeleteModel,
    baseEditModel,
    createAdminLogModel,
    getAllModel,
  } = require("../models/index.js"),
  { checkUUID } = require("../validation/index.js"),
  {
    badRequestResponse,
    failedResponse,
    notAuthorisedResponse,
    respondWithDbResult,
    respondWithDbBoolean,
  } = require("../responses/index.js"),
  { kickIfNotAdminModel } = require("../adminModels/index.js"),
  { validateAddGroup, validateEditGroup } = require("../validation/groups.js");

const setAdminGroupRoutes = (app) => {
  // get all groups
  // check if admin
  // model
  // respond

  app.get("/admin/groups", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);

        return;
      }
      const allDataRes = await getAllModel("groups");
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

  app.post("/admin/groups", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);

        return;
      }
      input = validateAddGroup(input);
      if (input) {
        input = addUUID(input);
        const itWorked = await baseCreateModel(input, "groups");
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

  app.patch("/admin/groups", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);

        return;
      }
      input = validateEditGroup(input);
      if (input) {
        const itWorked = await baseEditModel(input, input.uuid, "groups");
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

  app.delete("/admin/groups", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);

        return;
      }
      input.uuid = await checkUUID(input.uuid);
      if (input.uuid) {
        const itWorked = await baseDeleteModel(input.uuid, "groups");
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
module.exports = { setAdminGroupRoutes };
