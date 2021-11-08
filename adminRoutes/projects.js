const { addUUID, getRequestBody } = require("../functions/translators.js");
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
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  createAdminLogModel,
  getAllModel,
} = require("../models/index.js");
const {
  validateAddProject,
  validateEditProject,
} = require("../validation/projects.js");

const setAdminProjectRoutes = (app) => {
  // get all groups
  // check if admin
  // model
  // respond

  app.get("/admin/projects", async (req, res) => {
    try {
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }

      const allGroupsData = await getAllModel("projects");
      respondWithDbResult(res, allGroupsData);
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

  app.post("/admin/projects", async (req, res) => {
    try {
      let input = await getRequestBody(req);

      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }

      input = validateAddProject(input);
      if (input) {
        input = addUUID(input);
        const itWorked = await baseCreateModel(input, "projects");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "addprj",
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

  app.patch("/admin/projects", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input = validateEditProject(input);
      if (input) {
        const itWorked = await baseEditModel(input, input.uuid, "projects");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "updtprj",
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

  app.delete("/admin/projects", async (req, res) => {
    try {
      let input = await getRequestBody(req);
      const isAdmin = await kickIfNotAdminModel(req, res);
      if (!isAdmin) {
        notAuthorisedResponse(res);
        return;
      }
      input.uuid = await checkUUID(input.uuid);
      if (input.uuid) {
        const itWorked = await baseDeleteModel(input.uuid, "projects");
        respondWithDbBoolean(res, itWorked);
        createAdminLogModel(
          "delprj",
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

module.exports = {setAdminProjectRoutes};
