// const the express app obj
const { getRequestBody } = require("../functions/translators.js"),
  { checkTokenUUID, checkUUID } = require("../validation/index.js"),
  { extractFromToken } = require("../session/index.js"),
  {
    badRequestResponse,
    notAuthorisedResponse,
    respondWithDbBoolean,
    respondWithDbResult,
  } = require("../responses/index.js"),
  {
    deleteGroupMemberModel,
    getGroupFromMemberModel,
    getGroupFromRoleModel,
    getGroupMembersModel,
    getGroupRolesModel,
    updateGroupMemeberModel,
    updateRoleModel,
  } = require("../models/members.js"),
  { checkMembershipModel } = require("../models/groups.js"),
  { validateEditRole } = require("../validation/members.js"),
  { getMembershipsModel } = require("../models/groups.js");
const setMemberRoutes = (app) => {
  // get group members
  // validate the input
  // check membership
  // get group members
  // respond
  app.get("/members", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);

    if (await checkUUID(input.uuid)) {
      const isMember = checkMembershipModel(tokenData.uuid, input.uuid);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
      const groupMembers = await getGroupMembersModel(input.uuid);
      respondWithDbResult(res, groupMembers);
    } else {
      badRequestResponse(res);
    }
  });

  // get my memberships
  // validate user token
  // get from db
  // respond
  app.get("/mymemberships", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    const myGroups = await getMembershipsModel(tokenData.uuid);
    respondWithDbResult(res, myGroups);
  });

  // update a member's role
  // get input
  // check group permision
  // edit mem
  // respond
  app.patch("/members", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input.uuid = await checkUUID(input.uuid);
    input.roleID = await checkUUID(input.roleID);
    if (input.uuid && input.roleID) {
      const groupID = await getGroupFromMemberModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 5);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
      const didEdit = await updateGroupMemeberModel(input.roleID, input.uuid);
      respondWithDbBoolean(res, didEdit, input);
    } else {
      badRequestResponse(res);
      return;
    }
  });

  // delete group's member
  // validate uuids
  // check permision - grps
  // delete member
  // send response
  app.delete("/members", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromMemberModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 5);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
      const didEdit = await deleteGroupMemberModel(input.uuid);
      respondWithDbBoolean(res, didEdit, input);
    } else {
      badRequestResponse(res);
      return;
    }
  });

  // updt group's role
  // check permision - grp
  // validate name
  // update by id
  // send response
  app.patch("/roles", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.uuid)) {
      const groupID = await getGroupFromRoleModel(input.uuid);
      const isMember = await checkMembershipModel(tokenData.uuid, groupID, 5);
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    input = validateEditRole(input);
    if (input) {
      const didEdit = await updateRoleModel(input, input.uuid);
      respondWithDbBoolean(res, didEdit, input);
    } else {
      badRequestResponse(res);
    }
  });

  // read group's rols
  // validate uuids
  // check permision - grp
  // get roles
  // send response
  app.get("/roles", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input.uuid = await checkUUID(input.uuid);
    if (input.uuid) {
      const isMember = await checkMembershipModel(
        tokenData.uuid,
        input.uuid,
        1
      );
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
      const groupRoles = await getGroupRolesModel(input.uuid);
      respondWithDbResult(res, groupRoles);
    } else {
      badRequestResponse(res);
      return;
    }
  });
};

module.exports = {setMemberRoutes};
