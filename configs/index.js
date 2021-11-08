// db connection object
const DBConfigs = {
  host: "localhost",
  user: "root",
  database: "dr_catcomps",
};

// configs for connecting to redis
const redisConfigs = {
  port: 6379,
  host: "127.0.0.1",
};

// the port to be used if not set with env
const backupPort = 5000;

// The Secret Key for JWT
const secretKey = "JustAsecretKey154";

const adminSecretKey = "AdminsecretKey154";

// Restricts access to listed IPs
// add a host to the allows array to allow access
const IPAccessOptions = {
  mode: "allows",
  allows: ["127.0.0.1", "::1"],
  forceConnectionAddress: false,
  log: function (clientIp, access) {
    // console.log(clientIp + (access ? " accessed." : " denied."));
  },
  statusCode: 401,
  message: "IP Not Authorized",
};

// set the amount of requsts allowed as well as the refresh timer
const rateLimitOptions = {
  shortExpiry: 10,
  longExpiry: 24 * 60 * 60,
  shortMax: 10,
  longMax: 1000,
};

// allows for custom response headers to be read by JS
const corsOptions = {
  exposedHeaders: "X-auth",
  allowedHeaders: "user-auth , content-type , admin-auth",
};

module.exports = {
  DBConfigs,
  backupPort,
  secretKey,
  adminSecretKey,
  IPAccessOptions,
  rateLimitOptions,
  corsOptions,
};
