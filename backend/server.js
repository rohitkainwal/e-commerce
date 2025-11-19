import app from "./app.js";
import { connectDB } from "./src/config/database.config.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, (err) => {
      if (err) {
        console.log("error while starting the express server");
        process.exit(1);
      } else {
        console.log(`server is running at port : ${process.env.PORT}`);
      }
    });
  })

  .catch((err) => {
    console.log("error while connecting to database");
    console.log(err);
    process.exit(1);
  });
