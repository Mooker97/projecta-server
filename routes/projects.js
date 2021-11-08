const {
    addUUID,
    compileBuffered,
    getRequestBody,
  } = require("../functions/translators.js"),
  {
    checkMembershipModel,
    getMyGroupsModel,
    getMembershipsModel,
    deleteGroupModel,
    getProjectChildren,
  } = require("../models/groups.js"),
  { createLogModel } = require("../models/index.js"),
  {
    createProjectModel,
    deleteProjectModel,
    editProjectModel,
    getGroupFromProjectModel,
    getProjectModel,
    getProjectTasksModel,
  } = require("../models/projects.js"),
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
  {
    validateAddProject,
    validateEditProject,
  } = require("../validation/projects.js");

const setProjectRoutes = async (app) => {
  // check for user
  // check membership in group
  // create project with group ID
  // respond & log
  app.post("/addproject", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.parentID)) {
      const isMember = await checkMembershipModel(
        tokenData.uuid,
        input.parentID,
        4
      );
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }

    // validate inputs
    input = validateAddProject(input);
    if (input) {
      input = addUUID(input);
      const didMake = await createProjectModel(input);
      respondWithDbBoolean(res, didMake, input);
      createLogModel(
        "addprj",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didMake
      );
    } else {
      // bad input or login
      badRequestResponse(res);
    }
  });

  // check permision for user - group
  // edit the project info
  // send response
  app.patch("/projects", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input = validateEditProject(input);
    // get the groupID from the DB
    // check permission for that group
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromProjectModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 4);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input) {
      const didEdit = await editProjectModel(input, input.uuid);
      respondWithDbBoolean(res, didEdit, input);
      createLogModel(
        "updtprj",
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
  app.delete("/projects", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromProjectModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 4);
      if (isMember) {
        const didDelete = await deleteProjectModel(input.uuid);
        respondWithDbBoolean(res, didDelete, input);
        createLogModel(
          "delprj",
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

  // get one project
  // validate user and uuid
  // check membership
  // get project
  // if good, get tasks for project
  // reply
  app.post("/projects", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    console.log(checkUUID(input.uuid));
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromProjectModel(input.uuid);
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
      const projectDetails = await getProjectModel(input.uuid);
      const dbResultStatus = checkDBReturn(projectDetails);
      if (dbResultStatus === 200) {
        let returnData = {
          project: projectDetails,
        };
        const taskArr = await getProjectTasksModel(input.uuid);
        if (checkDBReturn(taskArr) === 200) {
          returnData.tasks = taskArr;
        }
        successResponse(res, returnData);
      } else if (dbResultStatus === 404) {
        emptyResponse(res);
      } else {
        failedResponse(res);
      }
    }
  });
};

module.exports = {setProjectRoutes};
