import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import CustomError from "./src/utils/CustomError.util.js";
import adminDashboardRoutes from "./src/routes/admin/dashboard.route.js";
import adminOrderRoutes from "./src/routes/admin/order.route.js";
import adminProductRoutes from "./src/routes/admin/product.route.js";
import adminServiceAreaRoutes from "./src/routes/admin/serviceArea.route.js";
import adminUserRoutes from "./src/routes/admin/user.route.js";
import addressRoutes from "./src/routes/shop/address.route.js";
import cartRoutes from "./src/routes/shop/cart.route.js";
import orderRoutes from "./src/routes/shop/order.route.js";
import shopProductRoutes from "./src/routes/shop/product.route.js";
import serviceAreaRoutes from "./src/routes/shop/serviceArea.route.js";
import userRoutes from "./src/routes/user/user.route.js";

dotenv.config({ quiet: true });

const app = express();
const isProduction = process.env.NODE_ENV === "production";

//! render (and vercel) put our app behind their own proxy.
//! without this line express thinks every request came from the proxy itself,
//! so "secure" cookies and the rate limiter would not work properly
if (isProduction) app.set("trust proxy", 1);

//? sets a bunch of safe response headers (clickjacking, mime sniffing etc).
//? crossOriginResourcePolicy is turned off because our images come from cloudinary
app.use(helmet({ crossOriginResourcePolicy: false }));

//~ CORS --------------------------------------------------------------
//! the frontend is on vercel and the backend on render, so they are on
//! different domains. only the domains listed here are allowed to call us.
//? FRONTEND_URL can hold more than one address, separated by a comma
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, "")) //? remove the trailing slash if any
  .filter((url) => url.length > 0);

app.use(
  cors({
    origin: (origin, callback) => {
      //? no origin --> postman / curl / same server call, allow those
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);

      //? vercel makes a new url for every preview deploy, allowing those too
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(cleanOrigin))
        return callback(null, true);

      //? 403 instead of a plain Error, otherwise it comes out as a confusing 500
      return callback(new CustomError(403, `${origin} is not allowed by CORS`));
    },
    credentials: true, //? needed, otherwise cookie will not be sent from frontend
  })
);

app.use(cookieParser());
//! putting a size limit, otherwise someone can send a huge json body and eat the memory
app.use(express.json({ limit: "1mb" }));
app.use(morgan(isProduction ? "combined" : "dev"));

//~ rate limiting ------------------------------------------------------
//! without this, anyone can try thousands of passwords on /login,
//! or keep hitting forgot-password and flood a person's inbox
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //? 15 minutes
  max: 300, //? 300 requests per ip in that window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, //? only 10 tries on the password / email routes
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, //? a correct login should not count against the user
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes",
  },
});

app.use("/api", generalLimiter);
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/user/forgot-password", authLimiter);
app.use("/api/user/resend-email-link", authLimiter);
app.use("/api/user/update-password", authLimiter);

//~ health check -------------------------------------------------------
//? render pings this to know the app is alive.
//? it is also handy to open in the browser to check the deploy worked
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

//! all the routes
app.use("/api/user", userRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/order", adminOrderRoutes);
app.use("/api/admin/user", adminUserRoutes);
app.use("/api/admin/service-area", adminServiceAreaRoutes);
app.use("/api/shop/product", shopProductRoutes);
app.use("/api/shop/cart", cartRoutes);
app.use("/api/shop/address", addressRoutes);
app.use("/api/shop/order", orderRoutes);
app.use("/api/shop/service-area", serviceAreaRoutes);

//? if no route matched
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route Not Found" });
});

app.use(errorMiddleware);
export default app;
