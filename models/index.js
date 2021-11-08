const mysql = require("mysql2"),
  { DBConfigs } = require("../configs/index.js"),
  { addUUID, fromSqlToJs } = require("../functions/translators.js");
// importing from the config files as needed

// set the db connection configs and create the dn object
const db = mysql.createConnection(DBConfigs);

db.awaitQuery = async (query, varsArr = undefined) => {
  return new Promise((resolve, reject) => {
    db.query(query, varsArr, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// connect to the database and log it to console
const setMysql = () => {
  db.connect((err) => {
    if (err) {
      console.log(err);
      console.log("Fatal Error, Did you forget to turn on XAMPP mysql Server?");
    } else {
      console.log(
        `SQL Connected to Database ${db.config.database} with user ${db.config.user}`
      );
    }
  });
};

// Takes an object of key values that need to match the DB
// takes an id for the data being editted
// takes the table
// set the query and execute it with a catch for rejections
const baseEditModel = async (input, id, table, col = "uuid") => {
  delete input.uuid;
  let query = `UPDATE \`${table}\` SET ? WHERE ${table}.${col} = ?;
  `;
  const result = await db.awaitQuery(query, [input, id]).catch((err) => {
    console.log(err);
    return false;
  });
  try {
    return result.affectedRows;
  } catch {
    return null;
  }
};

// takes an id for the data being editted
// takes the table
// set the query and execute it with a catch for rejections
const baseDeleteModel = async (id, table) => {
  // set the query and execute it
  let query = `DELETE FROM \`${table}\` WHERE ${table}.uuid = ?;
  `;
  const result = await db.awaitQuery(query, id).catch((err) => {
    console.log(err);
    console.log(`Delete in \`${table}\` Query Rejected`);
    console.log(id);
    return false;
  });
  return result.affectedRows;
};

// Takes an object of key values that need to match the DB
// takes the table
// set the query and execute it with a catch for rejections
const baseCreateModel = async (input, table) => {
  // console.log("Got Add");
  // console.log(input);
  // set the query and execute it
  let query = `INSERT INTO \`${table}\` SET ?;
    `;
  const result = await db.awaitQuery(query, input).catch((err) => {
    console.log(err);
    console.log(`Create in \`${table}\` Query Rejected`);
    return false;
  });
  return result.affectedRows;
};

const getAllInArr = async (thisArr, table, col = "uuid") => {
  // get the group ids from the memberships
  let query = `SELECT * FROM \`${table}\` WHERE ${col} in (?)`;
  const result = await db.awaitQuery(query, [thisArr]).catch((err) => {
    console.log("Failed");
    console.log(err);
    return false;
  });
  return fromSqlToJs(result);
};

const getWhereModel = async (value, table, col = "uuid") => {
  let query = `SELECT * FROM \`${table}\` WHERE ${col} in (?)`;
  const result = await db.awaitQuery(query, value).catch((err) => {
    console.log("Failed");
    console.log(err);
    return false;
  });
  try {
    return fromSqlToJs(result);
  } catch (err) {
    return false;
  }
};

const getAllModel = async (table) => {
  let query = `SELECT * FROM \`${table}\` WHERE 1`;
  const result = await db.awaitQuery(query).catch((err) => {
    console.log("Failed");
    console.log(err);
    return false;
  });
  try {
    return fromSqlToJs(result);
  } catch (err) {
    return false;
  }
};

const getOneModel = async (table, col, val) => {
  let query = `SELECT * FROM \`${table}\` WHERE ${col} = ?`;
  const result = await db.awaitQuery(query, val).catch((err) => {
    console.log("Failed");
    console.log(err);
    return false;
  });
  try {
    return fromSqlToJs(result)[0];
  } catch (err) {
    return false;
  }
};

const getChildData = async (parentIDs, table, col = "parentID") => {
  let query = `SELECT * FROM \`${table}\` WHERE ${col} in (?)`;
  const result = await db.awaitQuery(query, [parentIDs]).catch((err) => {
    console.log("Failed");
    console.log(err);
    return false;
  });
  return fromSqlToJs(result);
};

const testModel = async () => {
  const table = "notes";
  const col = "uuid";
  const array = [
    "074a4c18-43e4-4c4c-8079-ceb70afd3c3x",
    "asda4c48-43e4-4c4c-8079-ceb70afd3c3d",
  ];
  const result = await db
    .awaitQuery(`select * from \`${table}\` where ${col} in (?)`, [array])
    .catch((err) => {
      console.log(err);
      return false;
    });
  return result;
};

// logs an event
const createLogModel = async (
  eventType,
  ipAddress,
  userID = null,
  data = false,
  success = true
) => {
  let toInsert = {
    eventType,
    userID,
    success,
    data: JSON.stringify(data),
    ipAddress,
  };
  if (!data) {
    toInsert.data = null;
  }
  toInsert = addUUID(toInsert);
  const result = await baseCreateModel(toInsert, "event_logs");
  return result;
};

// logs an admins event
const createAdminLogModel = async (
  eventType,
  ipAddress,
  adminID = null,
  data = false,
  success = true
) => {
  let toInsert = {
    eventType,
    adminID,
    success,
    data: JSON.stringify(data),
    ipAddress,
  };
  if (!data) {
    toInsert.data = null;
  }
  toInsert = addUUID(toInsert);
  const result = await baseCreateModel(toInsert, "admin_logs");
  return result;
};

// for try catch on routes, for loging catches

// // logs a caught fatal err
//  const crashLogModel = async (err , ipAddress = null , userID = null) => {
//   let toInsert = {
//     eventType : "ftlerr",
//     userID,
//     data: JSON.stringify(err),
//     ipAddress,
//     success : 0,
//   };
//   toInsert = addUUID(toInsert);
//   const result = await baseCreateModel(toInsert, "event_logs");
//   return result;
// }

module.exports = {
  db,
  setMysql,
  getAllInArr,
  testModel,
  getOneModel,
  getAllModel,
  getWhereModel,
  baseEditModel,
  baseCreateModel,
  baseDeleteModel,
  createAdminLogModel,
  createLogModel,
  getChildData,
};
