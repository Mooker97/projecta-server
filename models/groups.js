const { extractFromObjs, fromSqlToJs } = require("../functions/translators.js");
const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  db,
  getAllInArr,
  getChildData,
  getWhereModel,
} = require("./index.js");

// get all memberships for a user
const { checkUUID } = require("../validation/index");
const getMembershipsModel = async (userID) => {
  if (!checkUUID(userID)) {
    return false;
  }
  const groupsArr = await getWhereModel(userID, "member_info", "userID");
  return fromSqlToJs(groupsArr);
};

// return the mebership level for a group
const checkMembershipModel = async (user, groupID, accessLevel = 0) => {
  let accessQuery = "";
  if (accessLevel) {
    accessQuery = `AND accessLevel >= ${accessLevel}`;
  }
  if (!user || !groupID) {
    return false;
  }
  let query = `SELECT count(*) as 'count' FROM member_info WHERE userID = '${user}' AND groupID = '${groupID}' ${accessQuery}`;
  const result = await db.awaitQuery(query).catch((err) => {
    return false;
  });
  if (!result) {
    return false;
  }
  try {
    return result[0].count;
  } catch {
    return false;
  }
};

const getMyGroupsModel = async (memberships) => {
  const groupIDs = extractFromObjs(memberships, "groupID");
  return await getAllInArr(groupIDs, "groups");
};

// get the children of a parent, returns as array, or false if err
const getGroupChildren = async (groupID) => {
  const groupInfo = await getChildData([groupID], "projects");
  return fromSqlToJs(groupInfo);
};

const getProjectChildren = async (projectIDs) => {
  const projectInfo = await getChildData(projectIDs, "tasks");
  return fromSqlToJs(projectInfo);
};

// edit Group
const editGroupModel = async (input, id) => {
  return await baseEditModel(input, id, "groups");
};

// add Group
const createGroupModel = async (input) => {
  return await baseCreateModel(input, "groups");
};

// delete Group
const deleteGroupModel = async (id) => {
  return await baseDeleteModel(id, "groups");
};

// add the first member to a group, with max permisions
const addFoundingMember = async (data) => {
  const { uuid, userID, groupID } = data;
  const query = `INSERT into members values (? , ? , ? , (SELECT uuid from roles where accessLevel = 5 AND groupID = ?))`;
  const result = await db
    .awaitQuery(query, [uuid, userID, groupID, groupID])
    .catch((err) => {
      console.log(err);
      console.log(`Create in Members Query Rejected`);
      return false;
    });
  return result.affectedRows;
};
module.exports = {
  getMembershipsModel,
  checkMembershipModel,
  getMyGroupsModel,
  getGroupChildren,
  getProjectChildren,
  editGroupModel,
  createGroupModel,
  deleteGroupModel,
  addFoundingMember,
};
