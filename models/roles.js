const { baseEditModel, getWhereModel } = require("./index.js");

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

// get a group id from a role id
const getGroupFromRoleModel = async (id) => {
  const group = await getWhereModel(id, "roles");
  try {
    return group[0].groupID;
  } catch {
    return false;
  }
};
module.exports = { updateRoleModel, getGroupFromRoleModel, getGroupRolesModel };
