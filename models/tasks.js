const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  db,
  getWhereModel,
} = require("./index.js");

// edit Project
const editTaskModel = async (input, id) => {
  return await baseEditModel(input, id, "tasks");
};

// add Project
const createTaskModel = async (input) => {
  return await baseCreateModel(input, "tasks");
};

// delete Project
const deleteTaskModel = async (id) => {
  return await baseDeleteModel(id, "tasks");
};

const getGroupFromTaskModel = async (id) => {
  const result = await getWhereModel(id, "task_group", "taskID");
  try {
    return result[0].groupID;
  } catch {
    return false;
  }
};

const getTaskModel = async (id) => {
  try {
    return await getWhereModel(id, "tasks", "uuid");
  } catch {
    return false;
  }
};
module.exports = {
  getTaskModel,
  getGroupFromTaskModel,
  deleteTaskModel,
  createTaskModel,
  editTaskModel,
};
