// import of modules happens in the appropriate file
// is this bad practice?

// import the setup functions from the index route
// index route contains express setup and other events common to all routes
const { setExpress } = require("./routes/index.js");
// sends a function ( and a param ) to be run when the server starts

setExpress();
