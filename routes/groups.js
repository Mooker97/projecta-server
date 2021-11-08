// import the express app obj
const {
    addUUID,
    extractFromObjs,
    getRequestBody,
  } = require("../functions/translators.js"),
  {
    checkMembershipModel,
    getGroupChildren,
    getMyGroupsModel,
    getMembershipsModel,
    getProjectChildren,
    createGroupModel,
    addFoundingMember,
    deleteGroupModel,
    editGroupModel,
  } = require("../models/groups.js"),
  { createLogModel } = require("../models/index.js"),
  {
    badRequestResponse,
    emptyResponse,
    failedResponse,
    notAuthorisedResponse,
    successResponse,
    respondWithDbBoolean,
    respondWithDbResult,
  } = require("../responses/index.js"),
  { extractFromToken } = require("../session/index.js"),
  { validateAddGroup, validateEditGroup } = require("../validation/groups.js"),
  {
    checkDBReturn,
    checkUUID,
    validateInputs,
  } = require("../validation/index.js");

  // { app } = require("./index.js");

// get the details of all my groups
const setGroupRoutes = async (app) => {
  // get the user id from encrypted token
  // gets users memberships
  // gets those groups
  // sends as json
  app.get("/mygroups", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    const memberships = await getMembershipsModel(tokenData.uuid);
    let dbReturnStatus = checkDBReturn(memberships);
    if (dbReturnStatus === 200) {
      const groupData = await getMyGroupsModel(memberships);
      respondWithDbResult(res, groupData);
    } else if (dbReturnStatus === 404) {
      emptyResponse(res);
    } else {
      failedResponse(res);
    }
  });

  // get the children of a a group
  // get the user id from encrypted token
  // get the requested group id from request body
  // check for membership in specified group
  // get all the data for that group
  // get the projects and any children
  // checks for existance of values before requesting from db
  // sends as json
  app.post("/groups", async (req, res) => {
    // get the user info
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    // check if the user is a member of the specified group
    let input = await getRequestBody(req);
    let isMember = false;
    if (checkUUID(input.uuid)) {
      isMember = await checkMembershipModel(tokenData.uuid, input.uuid);
    }
    if (isMember) {
      // get the projects that are children
      // check the return
      const projectArr = await getGroupChildren(input.uuid);
      let dbResultStatus = checkDBReturn(projectArr);
      if (dbResultStatus === 200) {
        // if found some projects
        // assign them to be returned
        let returnData = {
          projects: projectArr,
        };
        // get the ids from that arr
        const projectIDs = extractFromObjs(projectArr);
        // get the tasks that are children
        const taskArr = await getProjectChildren(projectIDs);
        dbResultStatus = checkDBReturn(taskArr);
        if (dbResultStatus === 200) {
          // if found tasks
          // add data to return
          returnData.tasks = taskArr;
        }
        successResponse(res, returnData);
      } else if (dbResultStatus === 404) {
        emptyResponse(res);
      } else {
        failedResponse(res);
      }
    } else {
      notAuthorisedResponse(res);
    }
  });

  // create a group
  // check for user
  // create group
  // create roles - done by mysql automatically
  // create membership for user
  // respond
  app.post("/addgroup", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    // validate inputs
    input = validateAddGroup(input);
    if (input) {
      input = addUUID(input);
      const groupCreated = await createGroupModel(input);
      if (groupCreated === 1) {
        // create the membership slot for the active user
        let memberData = {
          userID: tokenData.uuid,
          groupID: input.uuid,
        };
        memberData = addUUID(memberData);
        const madeMember = await addFoundingMember(memberData);
        if (madeMember) {
          // respond and log add
          successResponse(res, input);
          createLogModel(
            "addgrp",
            req.socket.remoteAddress,
            tokenData.uuid,
            input
          );
        } else {
          // handle this error
          // delete the created group?
          console.log("Member not created");
        }
      } else {
        successResponse(res, input);
        createLogModel(
          "addgrp",
          req.socket.remoteAddress,
          tokenData.uuid,
          input,
          0
        );
        failedResponse(res);
      }
    } else {
      // bad input or login
      badRequestResponse(res);
    }
  });

  // update a groups details
  // check permision for user - group
  // edit the groups info
  // send response
  app.patch("/groups", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (!checkUUID(input.uuid)) {
      badRequestResponse(res);
      return;
    }
    const isMember = await checkMembershipModel(tokenData.uuid, input.uuid, 5);
    if (!isMember) {
      notAuthorisedResponse(res);
      return;
    }
    input = validateEditGroup(input);
    if (input) {
      const didEdit = await editGroupModel(input, input.uuid);
      respondWithDbResult(res, didEdit);
      createLogModel(
        "updtgrp",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didEdit
      );
    } else {
      badRequestResponse(res);
    }
  });

  // delete a group, cascade children
  // check the user has permission to delete
  // validate inputs
  // call delete model
  // send response
  app.delete("/groups", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    // check validation
    input = await checkUUID(input.uuid);
    if (input) {
      const isMember = await checkMembershipModel(tokenData.uuid, input);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
      const didDelete = await deleteGroupModel(input);
      respondWithDbBoolean(res, didDelete);
      createLogModel(
        "delgrp",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didDelete
      );
    } else {
      badRequestResponse(res);
    }
  });
};
module.exports = {setGroupRoutes}