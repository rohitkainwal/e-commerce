import app from "./app.js";
import { connectDB } from "./src/config/database.config.js";
import { seedAdmin } from "./src/seed/admin.seed.js";

const PORT = process.env.PORT || 9000;

//? keeping the server object here so the shutdown code below can close it
let server;

connectDB()
  .then(async () => {
    //? create the admin account once, if it is not there already
    await seedAdmin();

    //! 0.0.0.0 means "listen on every network interface".
    //! render runs us inside a container, so listening only on localhost
    //! would make the app unreachable from outside
    server = app.listen(PORT, "0.0.0.0", (err) => {
      if (err) {
        //! most common one --> another server is already running on this port
        if (err.code === "EADDRINUSE") {
          console.log(`\nPort ${PORT} is already being used by another app.`);
          console.log(`Maybe the server is already running in another terminal.`);
          console.log(`Close that one, or find and stop it with:`);
          console.log(`   netstat -ano | findstr :${PORT}`);
          console.log(`   taskkill /PID <pid> /F\n`);
        } else {
          console.log(err);
          console.log(`Error while starting the server`);
        }
        process.exit(1);
      } else console.log(`Server running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error while connecting to database`);
    //? if mongodb is not started, the server cannot run
    if (err.name === "MongooseServerSelectionError") {
      console.log(`Could not reach MongoDB. Please make sure mongod is running.`);
    } else {
      console.log(err);
    }
    process.exit(1);
  });

//~ shutting down nicely ------------------------------------------------
//! when render restarts or redeploys the app, it sends a SIGTERM signal.
//! if we die immediately, any request being handled right then is cut off.
//! so we stop taking new requests, finish the running ones, then exit.
const shutDown = (signal) => {
  console.log(`\n${signal} received, closing the server...`);

  if (!server) process.exit(0);

  server.close(() => {
    console.log("Server closed, bye");
    process.exit(0);
  });

  //? if something is stuck and close() never finishes, force exit after 10s
  setTimeout(() => {
    console.log("Could not close in time, forcing exit");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT")); //? this one is ctrl+c

//! if some promise fails and nobody catches it, at least print it properly
//! instead of the process dying with no reason
process.on("unhandledRejection", (reason) => {
  console.log("Unhandled promise rejection:");
  console.log(reason);
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught exception:");
  console.log(error);
  process.exit(1);
});

//! after enabling 2 factor authentication
// ? 1) go to google account and search for app passwords
