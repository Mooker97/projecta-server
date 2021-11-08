const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  getWhereModel,
} = require("./index.js");

// edit Project
const editProjectModel = async (input, id) => {
  return await baseEditModel(input, id, "projects");
};

// add Project
const createProjectModel = async (input) => {
  return await baseCreateModel(input, "projects");
};

// delete Project
const deleteProjectModel = async (id) => {
  return await baseDeleteModel(id, "projects");
};

const getProjectModel = async (id) => {
  try {
    return await getWhereModel(id, "projects", "uuid");
  } catch {
    return false;
  }
};

const getProjectTasksModel = async (id) => {
  return await getWhereModel(id, "tasks", "parentID");
};

const getGroupFromProjectModel = async (id) => {
  const result = await getWhereModel(id, "projects");
  try {
    return result[0].parentID;
  } catch {
    return false;
  }
};
module.exports = {
  editProjectModel,
  createProjectModel,
  deleteProjectModel,
  getProjectTasksModel,
  getGroupFromProjectModel,
  getProjectModel,
};
