//  the express app obj
const { addUUID, getRequestBody } = require("../functions/translators.js"),
  { checkMembershipModel } = require("../models/groups.js"),
  { createLogModel } = require("../models/index.js"),
  { getGroupFromProjectModel } = require("../models/projects.js"),
  {
    createTaskModel,
    deleteTaskModel,
    editTaskModel,
    getGroupFromTaskModel,
    getTaskModel,
  } = require("../models/tasks.js"),
  {
    badRequestResponse,
    emptyResponse,
    failedResponse,
    notAuthorisedResponse,
    respondWithDbBoolean,
    respondWithDbResult,
    successResponse,
  } = require("../responses/index.js"),
  { extractFromToken } = require("../session/index.js"),
  { checkDBReturn, checkUUID } = require("../validation/index.js"),
  { validateAddTask, validateEditTask } = require("../validation/tasks.js");
const setTaskRoutes = async (app) => {
  // check for user
  // check membership in group
  // create project with group ID
  // respond & log
  app.post("/addtask", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }

    let input = await getRequestBody(req);
    if (await checkUUID(input.parentID)) {
      const groupID = await getGroupFromProjectModel(input.parentID);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 3);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    input = validateAddTask(input);
    if (input) {
      input = addUUID(input);
      const taskCreated = await createTaskModel(input);
      respondWithDbBoolean(res, taskCreated, input);
      createLogModel(
        "addtsk",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        taskCreated
      );
    } else {
      // bad input or login
      badRequestResponse(res);
    }
  });

  // check permision for user - group
  // edit the project info
  // send response
  app.patch("/tasks", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromTaskModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 3);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    input = validateEditTask(input);
    if (input) {
      const didEdit = await editTaskModel(input, input.uuid);
      respondWithDbBoolean(res, didEdit, input);
      createLogModel(
        "updttsk",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didEdit
      );
    } else {
      badRequestResponse(res);
    }
  });

  // check the user has permission to delete
  // validate inputs
  // call delete model
  // send response
  app.delete("/tasks", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromTaskModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 4);
      if (isMember) {
        const didDelete = await deleteTaskModel(input.uuid);
        respondWithDbBoolean(res, didDelete, input);
        createLogModel(
          "deltsk",
          req.socket.remoteAddress,
          tokenData.uuid,
          input,
          didDelete
        );
      } else {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
  });

  // get one task
  // validate user and uuid
  // check membership
  // get task
  // reply
  app.get("/tasks", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromTaskModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 1);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input) {
      const taskDetails = await getTaskModel(input.uuid);
      respondWithDbResult(res, taskDetails);
    }
  });
};

module.exports = {setTaskRoutes};
