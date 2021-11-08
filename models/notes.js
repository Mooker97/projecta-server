const {
  baseCreateModel,
  baseDeleteModel,
  baseEditModel,
  getAllInArr,
  db,
  getWhereModel,
} = require("./index.js");

// edit Notes
const editNoteModel = async (input, id) => {
  delete input.uuid;
  const noteType = input.type;
  delete input.type;
  switch (noteType) {
    case "task":
      return await baseEditModel(input, id, "task_notes");
      break;
    case "project":
      return await baseEditModel(input, id, "project_notes");
      break;
    case "group":
      return await baseEditModel(input, id, "group_notes");
      break;
  }
};

// add Notes
const createNoteModel = async (input, user) => {
  // remove type from the object being inserted
  const noteType = input.type;
  delete input.type;
  input.createdBy = user;
  switch (noteType) {
    case "task":
      return await baseCreateModel(input, "task_notes");
      break;
    case "project":
      return await baseCreateModel(input, "project_notes");
      break;
    case "group":
      return await baseCreateModel(input, "group_notes");
      break;
  }
};

// delete Notes
const deleteNoteModel = async (input) => {
  switch (input.type) {
    case "task":
      return await baseDeleteModel(input.uuid, "task_notes");
      break;
    case "project":
      return await baseDeleteModel(input.uuid, "project_notes");
      break;
    case "group":
      return await baseDeleteModel(input.uuid, "group_notes");
      break;
  }
};

const checkNoteCreatorModel = async (id, userID, type) => {
  let table;
  switch (type) {
    case "task":
      table = "task_notes";
      break;
    case "project":
      table = "project_notes";
      break;
    case "group":
      table = "group_notes";
      break;
  }
  const query = `SELECT count(*) as count from ${table} WHERE uuid = ? and createdBy = ?`;
  const result = await db.awaitQuery(query, [id, userID]).catch((err) => {
    console.log(err);
    return false;
  });
  try {
    if (result[0].count === 1) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const getAllNoteModel = async (id, type) => {
  switch (type) {
    case "task":
      return await getWhereModel(id, "task_notes", "parentID");
      break;
    case "project":
      return await getWhereModel(id, "project_notes", "parentID");
      break;
    case "group":
      return await getWhereModel(id, "group_notes", "parentID");
      break;
  }
};

const getMyNotesModel = async (userID, type) => {
  switch (type) {
    case "task":
      return await getWhereModel(userID, "task_notes", "createdBy");
      break;
    case "project":
      return await getWhereModel(userID, "project_notes", "createdBy");
      break;
    case "group":
      return await getWhereModel(userID, "group_notes", "createdBy");
      break;
  }
};

module.exports = {
  editNoteModel,
  createNoteModel,
  deleteNoteModel,
  checkNoteCreatorModel,
  getAllNoteModel,
  getMyNotesModel,
};
