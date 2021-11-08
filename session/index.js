const jwt = require("jsonwebtoken"),
  { adminSecretKey, secretKey } = require("../configs/index.js"),
  net = require("net");

// check a port for connection
const checkConnection = async (configs, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    reject("disabled");
  });
  reject();
  return new Promise(function (resolve, reject) {
    let timer = setTimeout(function () {
      reject("timeout");
      socket.destroy();
    }, timeout);
    let socket = net.createConnection(configs.port, configs.host, function () {
      clearTimeout(timer);
      resolve(true);
      socket.destroy();
    });
    socket.on("error", function (err) {
      clearTimeout(timer);
      reject(err);
    });
  });
};

const signInJWT = (user) => {
  const newToken = jwt.sign(user, secretKey, {
    expiresIn: "10d",
    issuer: "Server",
  });
  return newToken;
};

const signInJWTAdmin = (user) => {
  const newToken = jwt.sign(user, adminSecretKey, {
    expiresIn: "10d",
    issuer: "Server",
  });
  return newToken;
};

const extractFromToken = (token) => {
  try {
    let tokenInfo = jwt.verify(token, secretKey);
    return tokenInfo;
  } catch {
    return false;
  }
};

const extractFromAdminToken = (token) => {
  try {
    let tokenInfo = jwt.verify(token, adminSecretKey);
    return tokenInfo;
  } catch {
    return false;
  }
};

// asyncified redis calls
// check if client is set before trying anything

const asyncRedisRead = async (key) => {
  return new Promise((resolve) => {
    if (client) {
      client.get(key, (err, res) => {
        if (err) {
          console.log(err);
          resolve("Error");
        } else {
          resolve(res);
        }
      });
    } else {
      console.log("Redis Server not connected");
      resolve("Not Connected");
    }
  });
};

const asyncRedisWrite = async (key, value) => {
  return new Promise((resolve) => {
    if (client) {
      client.set(key, value, (err, res) => {
        if (err) {
          console.log(err);
          resolve("err");
        } else {
          resolve(true);
        }
      });
    } else {
      console.log("Redis Server not connected");
      resolve("Not Connected");
    }
  });
};

module.exports = {
  checkConnection,
  signInJWT,
  signInJWTAdmin,
  extractFromAdminToken,
  extractFromToken,
};
