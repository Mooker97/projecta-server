const { baseCreateModel, db, getWhereModel } = require("./index.js");

// get group invites
const getGroupInvitesModel = async (groupID) => {
  const invitesArr = await getWhereModel(groupID, "invites", "groupID");
  return invitesArr;
};

// delete group invite
const deleteInviteModel = async (userID, groupID) => {
  const query = `delete from invites where userID = ? and groupID = ?`;
  const result = await db.awaitQuery(query, [userID, groupID]).catch((err) => {
    console.log(err);
    return failedResponse;
  });
  try {
    return result.affectedRows;
  } catch {
    return false;
  }
};

// create inv
const createInviteModel = async (input) => {
  const didCreate = await baseCreateModel(input, "invites");
  return didCreate;
};

// get my invs
const getMyInvitesModel = async (userID) => {
  const invitesArr = await getWhereModel(userID, "invite_group", "userID");
  return invitesArr;
};

// reply inv
const replyToInviteModel = async (userID, groupID, reply) => {
  console.log(userID);
  console.log(groupID);
  console.log(reply);
  if (reply) {
    reply = 1;
  } else {
    reply = 0;
  }
  const query = `update invites set accepted = ${reply} where userID = ? and groupID = ?`;
  const result = await db.awaitQuery(query, [userID, groupID]);
  try {
    return result.affectedRows;
  } catch {
    return null;
  }
};

// get a group id from an inv id
const getGroupFromInviteModel = async (id) => {
  const group = await getWhereModel(id, "invites");
  try {
    return group[0].groupID;
  } catch {
    return false;
  }
};

// get a user id from an inv id
const getUserFromInviteModel = async (id) => {
  const user = await getWhereModel(id, "invites");
  try {
    return user[0].userID;
  } catch {
    return false;
  }
};

// get a group id from a role id
const getGroupFromRoleModel = async (id) => {
  const group = await getWhereModel(id, "roles");
  try {
    return group[0].groupID;
  } catch {
    return false;
  }
};
module.exports = {
  getGroupFromInviteModel,
  deleteInviteModel,
  replyToInviteModel,
  getGroupFromRoleModel,
  getUserFromInviteModel,
  getMyInvitesModel,
  createInviteModel,
  getGroupInvitesModel,
};
