import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
   const token = req.headers["authorization"]?.split(" ")[1];
   if (!token)
      return res
         .status(401)
         .json({ success: false, message: "No token provided" });
   jwt.verify(token, "your-secret-key", (err, decoded) => {
      if (err)
         return res
            .status(401)
            .json({ success: false, message: "Invalid token" });
      req.user = decoded;
      next();
   });
};

const restrictToOrganizer = (req, res, next) => {
   if (req.user.user_type !== "organizer") {
      return res.status(403).json({
         success: false,
         message: "Access restricted to organizers only",
      });
   }
   next();
};

export { authenticate, restrictToOrganizer };
