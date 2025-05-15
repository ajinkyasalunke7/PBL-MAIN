import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authenticate, restrictToOrganizer } from "./utils/helper.js";
import defineAssociations from "./models/associations.js";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from "jsonwebtoken"

// Middlewares
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

// Routes
import userRouter from "./routes/userRoutes.js";
import utilsRouter from "./routes/utilsRouter.js";
import sequelize from "./config/db.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import topicRouter from "./routes/topicRouter.js";

const app = express();
// app.use(cors());
console.log("FRONTEND =", process.env.FRONTEND);
// const whitelist = (process.env.FRONTEND || "")
//    .split(",")
//    .map(o => o.trim());

// const corsOptions = {
//    origin: function (incomingOrigin, callback) {
//       if (whitelist.includes(incomingOrigin)) {
//          callback(null, true);            // allowed
//       } else {
//          callback(new Error("Not allowed by CORS"));  // rejected
//       }
//    }
// };

// app.use(cors(corsOptions));

app.use(
   cors({
      origin: [process.env.FRONTEND],
   })
);

// app.use((req, res, next) => {
//    const apiKey = req.headers['x-api-key'];

//    if (apiKey === process.env.SECRET_API_KEY && jwt.verify(apiKey, process.env.REQUEST_SECRET)) {
//       next();
//    } else {
//       res.status(403).json({ message: "Unauthorized request" });
//    }
// });

// Use()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// const authenticate = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token)
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided" });
//   jwt.verify(token, "your-secret-key", (err, decoded) => {
//     if (err)
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     req.user = decoded;
//     next();
//   });
// };

// const restrictToOrganizer = (req, res, next) => {
//   if (req.user.user_type !== "organizer") {
//     return res.status(403).json({
//       success: false,
//       message: "Access restricted to organizers only",
//     });
//   }
//   next();
// };

// app.use(express.static("public"));

// Test route

app.get("/", (req, res, next) => {
   res.status(200).json({ message: "Server running" });
});

// Routers
// app.use(rateLimit({
//    windowMs: 15 * 60 * 1000, // 15 minutes
//    max: 100 // limit each IP to 100 requests per windowMs
// }));
app.use("/api/user", userRouter);

app.use("/api/organizer", authenticate, restrictToOrganizer, organizerRoutes);

// Judge routes
import judgeRoutes from "./routes/judgeRoutes.js";
app.use("/api/judge", judgeRoutes);
app.use("/api/utils", utilsRouter);
app.use("/api", topicRouter);

const dropTablesInOrder = async () => {
   try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await sequelize.drop();
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      // console.log("All tables dropped successfully");
   } catch (error) {
      console.error("Error dropping tables:", error);
   }
};
// Db Connection
sequelize
   .authenticate()
   .then(async () => {
      console.log("Database connected");
      // await dropTablesInOrder();
      defineAssociations();
      await sequelize.sync({ alter: true });
   })
   .catch((err) => console.error("Database connection error:", err));

// Global Error Handler
app.use(globalErrorHandler);

export default app;
