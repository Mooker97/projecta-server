const Express = require("express"),
  Redis = require("redis"),
  cors = require("cors"),
  RateLimit = require("express-rate-limit"),
  RedisStore = require("rate-limit-redis"),
  AccessControl = require("express-ip-access-control"),
  {
    backupPort,
    redisConfigs,
    IPAccessOptions,
    rateLimitOptions,
    corsOptions,
  } = require("../configs/index.js"),
  { setMysql } = require("../models/index.js"),
  { checkConnection } = require("../session/index.js"),
  { setUserRoutes } = require("./users.js"),
  { setGroupRoutes } = require("./groups.js"),
  { setProjectRoutes } = require("./projects.js"),
  { setTaskRoutes } = require("./tasks.js"),
  { setNoteRoutes } = require("./notes.js"),
  { setMemberRoutes } = require("./members.js"),
  { setInviteRoutes } = require("./invites.js"),
  { setRoleRoutes } = require("./roles.js"),
  { setAdminLoginRoutes } = require("../adminRoutes/login.js"),
  { setAdminGroupRoutes } = require("../adminRoutes/groups.js"),
  { setAdminProjectRoutes } = require("../adminRoutes/projects.js"),
  { setAdminTaskRoutes } = require("../adminRoutes/tasks.js"),
  { setAdminUserRoutes } = require("../adminRoutes/users.js"),
  { setAdminMemberRoutes } = require("../adminRoutes/members.js");

// create the app function from express
const app = Express();
let redisClient = null;
// takes in a function to run on startup
const setExpress = async (param = null) => {
  // use cors

  app.use(cors(corsOptions));

  app.use(AccessControl(IPAccessOptions));
  // set the port
  // set express to listen on the port
  const PORT = backupPort;
  app.listen(PORT, () => {
    // set the function to be run one the app is listening
    console.clear();
    console.log("");
    console.log("");
    console.log(`--------------------------------------------------`);
    console.log(`         Server Running On Port ${PORT}`);
    console.log(`--------------------------------------------------`);
    console.log("");
    setMysql();
  });

  // try to connect to redis
  // set the client object to null
  // check if the port is open
  // connect if the port is there
  checkConnection(redisConfigs)
    .then(() => {
      redisClient = Redis.createClient(redisConfigs);
      redisClient.on("errer", (err) => {
        console.log("Redis Error");
        console.log(err);
      });
      redisClient.on("ready", () => {
        console.log("Redis Running");
        // add the rate limiters
        const limiterShort = new RateLimit({
          store: new RedisStore({
            redisClient,
            expiry: rateLimitOptions.shortExpiry,
            prefix: "rlshrt", // sets a prefix to allow multiple limiters
          }),
          windowMs: rateLimitOptions.shortExpiry * 1000,
          max: rateLimitOptions.shortMax,
          message: `To many requests, maximum ${rateLimitOptions.shortMax} per ${rateLimitOptions.shortExpiry} seconds.`,
        });

        const limiterLong = new RateLimit({
          store: new RedisStore({
            redisClient,
            expiry: rateLimitOptions.longExpiry,
            prefix: "rllng", // sets a prefix to allow multiple limiters
          }),
          windowMs: rateLimitOptions.longExpiry * 1000,
          max: rateLimitOptions.longMax, // limit each IP to 100 requests per windowMs
          message: `To many requests, max ${rateLimitOptions.longMax} per day`,
        });
        // set the limiters to be used
        // set before the routes
        app.use(limiterLong);
        app.use(limiterShort);
        setAllRoutes(app);
        setAllAdminRoutes(app);
      });
    })
    .catch((err) => {
      console.log("No Redis");
      setAllRoutes(app);
      setAllAdminRoutes(app);
    });
};

const setAllRoutes = (app) => {
  // set the routes from the imported functions
  setUserRoutes(app);
  setGroupRoutes(app);
  setProjectRoutes(app);
  setTaskRoutes(app);
  setNoteRoutes(app);
  setMemberRoutes(app);
  setInviteRoutes(app);
  setRoleRoutes(app);
};

const setAllAdminRoutes = (app) => {
  setAdminLoginRoutes(app);
  setAdminGroupRoutes(app);
  setAdminProjectRoutes(app);
  setAdminTaskRoutes(app);
  setAdminUserRoutes(app);
  setAdminMemberRoutes(app);
  // set a test route for testing purposes
  app.get("/test", async (req, res) => {
    console.clear();
    res.end("Testing");
  });

  // allows the anon creation of admins
  // dont allow into final cut
  // app.post("/admin/register", async (req, res) => {
  //   try {
  //     let input = await getRequestBody(req);
  //     input = validateRegisterAdmin(input);
  //     if (input) {
  //       input = addUUID(input);
  //       const didWork = await createAdminModel(input);
  //       if (didWork) {
  //         successResponse(res, "Admin Creaated");
  //       } else {
  //         failedResponse(res);
  //       }
  //     } else {
  //       badRequestResponse(res);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     failedResponse(res);
  //   }
  // });
};



module.exports = { setExpress };
