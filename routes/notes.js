const {
    addUUID,
    compileBuffered,
    getRequestBody,
  } = require("../functions/translators.js"),
  { checkMembershipModel } = require("../models/groups.js"),
  { createLogModel } = require("../models/index.js"),
  {
    createNoteModel,
    deleteNoteModel,
    editNoteModel,
    getAllNoteModel,
    checkNoteCreatorModel,
    getMyNotesModel,
  } = require("../models/notes.js"),
  { getGroupFromTaskModel } = require("../models/tasks.js"),
  { getGroupFromProjectModel } = require("../models/projects.js"),
  {
    badRequestResponse,
    emptyResponse,
    failedResponse,
    notAuthorisedResponse,
    successResponse,
    respondWithDbBoolean,
    respondWithDbResult,
  } = require("../responses/index.js"),
  { extractFromToken } = require("../session/index.js"),
  { checkDBReturn, checkUUID } = require("../validation/index.js"),
  {
    validateAddNote,
    validateEditNote,
    validateGetNote,
  } = require("../validation/notes.js");
const setNoteRoutes = async (app) => {
  // check for user
  // check membership in group
  // create project with group ID
  // respond & log
  app.post("/addnote", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    if (await checkUUID(input.parentID)) {
      let isMember = false;
      let groupID;
      switch (input.type) {
        case "task":
          groupID = await getGroupFromTaskModel(input.parentID);
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 2);
          break;
        case "project":
          groupID = await getGroupFromProjectModel(input.parentID);
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 2);
          break;
        case "group":
          groupID = input.parentID;
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 3);
          break;
      }
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    input = validateAddNote(input);
    if (input) {
      input = addUUID(input);
      const didMake = await createNoteModel(input, tokenData.uuid);
      respondWithDbBoolean(res, didMake, input);
      createLogModel(
        "addnte",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didMake
      );
    } else {
      // bad input or login
      badRequestResponse(res);
    }
  });

  // check permision for user - group
  // edit the project info
  // send response
  app.patch("/notes", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input = validateEditNote(input);
    if (await checkUUID(input.uuid)) {
      const isOwner = await checkNoteCreatorModel(
        input.uuid,
        tokenData.uuid,
        input.type
      );
      if (!isOwner) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input) {
      const didEdit = await editNoteModel(input, input.uuid);
      respondWithDbBoolean(res, didEdit, input);
      createLogModel(
        "updtnte",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didEdit
      );
    } else {
      badRequestResponse(res);
    }
  });

  // check the user has permission to delete
  // validate inputs
  // call delete model
  // send response
  app.delete("/notes", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);

    input = validateGetNote(input);
    if (await checkUUID(input.uuid)) {
      const isOwner = await checkNoteCreatorModel(
        input.uuid,
        tokenData.uuid,
        input.type
      );
      if (!isOwner) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input) {
      const didDelete = await deleteNoteModel(input);
      respondWithDbBoolean(res, didDelete, input);
      createLogModel(
        "delnte",
        req.socket.remoteAddress,
        tokenData.uuid,
        input,
        didDelete
      );
    } else {
      badRequestResponse(res);
    }
  });

  // get all notes for some content
  // check user permission
  // get it
  // return depending on result from db
  app.get("/notes", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!checkUUID(tokenData.uuid)) {
      notAuthorisedResponse(res);
      return;
    }
    let input = await getRequestBody(req);
    input = validateGetNote(input);
    if (await checkUUID(input.uuid)) {
      let isMember = false;
      let groupID;
      switch (input.type) {
        case "task":
          groupID = await getGroupFromTaskModel(input.uuid);
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 2);
          break;
        case "project":
          groupID = await getGroupFromProjectModel(input.uuid);
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 2);
          break;
        case "group":
          groupID = input.uuid;
          isMember = await checkMembershipModel(tokenData.uuid, groupID, 3);
          break;
      }
      if (!isMember) {
        notAuthorisedResponse(res);
        return;
      }
    } else {
      badRequestResponse(res);
      return;
    }
    if (input) {
      const noteData = await getAllNoteModel(input.uuid, input.type);
      respondWithDbResult(res, noteData);
    } else {
      badRequestResponse(res);
    }
  });

  // get all notes for Signed in user
  // check user permission
  // get it
  // return depending on result from db
  app.get("/mynotes", async (req, res) => {
    const tokenData = extractFromToken(req.headers["user-auth"]);
    if (!(await checkUUID(tokenData.uuid))) {
      notAuthorisedResponse(res);
      return;
    }
    let myNotes = {};
    const groupNotes = await getMyNotesModel(tokenData.uuid, "group");
    if (groupNotes) {
      myNotes.group = groupNotes;
    }
    const projectNotes = await getMyNotesModel(tokenData.uuid, "project");
    if (projectNotes) {
      myNotes.project = projectNotes;
    }
    const taskNotes = await getMyNotesModel(tokenData.uuid, "task");
    if (taskNotes) {
      myNotes.task = taskNotes;
    }
    respondWithDbResult(res, myNotes);
  });
};
module.exports = {setNoteRoutes};
