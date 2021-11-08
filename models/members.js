const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  db,
  getWhereModel,
} = require("./index.js");

const getGroupMembersModel = async (groupID) => {
  const membersArr = await getWhereModel(groupID, "member_info", "groupID");
  return membersArr;
};

// update member
const updateGroupMemeberModel = async (roleID, id) => {
  const didUpdate = await baseEditModel({ roleID }, id, "members");
  return didUpdate;
};

// delete member
const deleteGroupMemberModel = async (id) => {
  const didDelete = await baseDeleteModel(id, "members");
  return didDelete;
};

// update role
const updateRoleModel = async (input, id) => {
  const didUpdate = await baseEditModel(input, id, "roles");
  return didUpdate;
};

// read roles
const getGroupRolesModel = async (groupID) => {
  const rolesArr = await getWhereModel(groupID, "roles", "groupID");
  return rolesArr;
};

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
  const invitesArr = await getWhereModel(userID, "invites", "userID");
  return invitesArr;
};

// reply inv
const replyToInviteModel = async (userID, groupID, reply) => {
  if (reply) {
    reply = 1;
  } else {
    reply = 0;
  }
  const query = `update invites set accepted = ${reply} where userID = ? and groupID = ?`;
  const result = await db.awaitQuery(query, [userID, groupID]);
  console.log(result);
  try {
    return result.affectedRows;
  } catch {
    return null;
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

// get a group id from a member id
const getGroupFromMemberModel = async (id) => {
  const result = await getWhereModel(id, "members");
  try {
    return result[0].groupID;
  } catch {
    return false;
  }
};
module.exports = {
  getGroupMembersModel,
  updateGroupMemeberModel,
  deleteGroupMemberModel,
  updateRoleModel,
  getGroupRolesModel,
  getGroupInvitesModel,
  deleteInviteModel,
  getMyInvitesModel,
  replyToInviteModel,
  getGroupFromRoleModel,
  getGroupFromMemberModel,
};
