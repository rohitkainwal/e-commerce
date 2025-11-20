import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import router from "./src/routes/user/user.route.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import cors from "cors"

dotenv.config({ quiet: true });

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json())
app.use("/api/user", router)

app.use(errorMiddleware)
export default app;