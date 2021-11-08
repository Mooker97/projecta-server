// import the express app obj
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
    getGroupFromRoleModel,
    getGroupRolesModel,
    updateRoleModel,
  } = require("../models/roles.js"),
  { checkMembershipModel } = require("../models/groups.js"),
  { validateEditRole } = require("../validation/members.js");

const setRoleRoutes = (app) => {
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

module.exports = {setRoleRoutes};
