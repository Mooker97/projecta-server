const { addUUID, getRequestBody } = require("../functions/translators.js");

const { checkUUID } = require("../validation/index.js");

const {
  badRequestResponse,
  failedResponse,
  notAuthorisedResponse,
  respondWithDbResult,
  respondWithDbBoolean,
} = require("../responses/index.js");
const { validateAddTask, validateEditTask } = require("../validation/tasks.js");
const { kickIfNotAdminModel } = require("../adminModels/index.js");
const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  createAdminLogModel,
  getAllModel,
} = require("../models/index.js");

const setAdminTaskRoutes = (app) => {
  // get all tasks
  // check if admin
  // model
  // respond

  app.get("/admin/tasks", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      const allDataRes = await getAllModel("tasks");
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

  app.post("/admin/tasks", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateAddTask(input);
      if (input) {
        input = addUUID(input);
        const itWorked = await baseCreateModel(input, "tasks");
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

  app.patch("/admin/tasks", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateEditTask(input);
      if (input) {
        const itWorked = await baseEditModel(input, input.uuid, "tasks");
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

  app.delete("/admin/tasks", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input.uuid = await checkUUID(input.uuid);
      if (input.uuid) {
        const itWorked = await baseDeleteModel(input.uuid, "tasks");
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

module.exports = {setAdminTaskRoutes};
