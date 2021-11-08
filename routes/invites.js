//  the express app obj
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
    createInviteModel,
    deleteInviteModel,
    getGroupInvitesModel,
    getMyInvitesModel,
    replyToInviteModel,
  } = require("../models/invites.js"),
  { checkMembershipModel } = require("../models/groups.js"),
  { validateAddInvite } = require("../validation/members.js"),
  { getUserFromNameModel } = require("../models/users.js");

const setInviteRoutes = (app) => {
  // get group's invs
  // validate uuid
  // check permision - grp
  // get where
  // send response
  app.post("/ourinvites", async (req, res) => {
    console.log("yay");

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
    } else {
      badRequestResponse(res);
      return;
    }
    if (input.uuid) {
      const groupInvites = await getGroupInvitesModel(input.uuid);
      respondWithDbResult(res, groupInvites);
    }
  });

  // delete grp's invs
  // validate all uuids
  // check permision - grp
  // del invitation
  // send response
  app.delete("/invites", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.groupID)) {
      const isMember = await checkMembershipModel(
        tokenData.uuid,
        input.groupID,
        5
      );
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (await checkUUID(input.userID)) {
      const didDelete = await deleteInviteModel(input.userID, input.groupID);
      respondWithDbBoolean(res, didDelete, input);
    } else {
      badRequestResponse(res);
      return;
    }
  });

  // send invite
  // check permision - grp
  // make invitation
  // send response
  app.post("/invites", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input.groupID = await checkUUID(input.groupID);
    if (input.groupID) {
      const isMember = await checkMembershipModel(
        tokenData.uuid,
        input.groupID,
        5
      );
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input.userName) {
      const user = await getUserFromNameModel(input.userName);
      if (user) {
        input.userID = user.uuid;
      } else {
        badRequestResponse(res);
        return;
      }
    }
    input.roleID = await checkUUID(input.roleID);
    input.userID = await checkUUID(input.userID);
    input = validateAddInvite(input);
    if (input) {
      const didMake = await createInviteModel(input);
      respondWithDbBoolean(res, didMake, input);
    }
  });

  // reply invite
  // validate input
  // update invitation
  // respond bool
  app.patch("/myinvites", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    console.log(input);
    const myInvites = await replyToInviteModel(
      tokenData.uuid,
      input.groupID,
      input.reply
    );
    respondWithDbBoolean(res, myInvites, input);
  });
  // get my invites
  // valid user
  // get where uuid
  app.get("/myinvites", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkTokenUUID(tokenData))) {
      notAuthorisedResponse(res);
      return;
    }
    const myInites = await getMyInvitesModel(tokenData.uuid);
    respondWithDbResult(res, myInites);
  });
};

module.exports = {setInviteRoutes}