import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const AuthGuard = ({ children, organizerOnly = false }) => {
   const navigate = useNavigate();
   const { enqueueSnackbar } = useSnackbar();

   useEffect(() => {
      const token = localStorage.getItem("token");
      const userType = localStorage.getItem("userType");

      if (!token) {
         enqueueSnackbar("Please log in first", { variant: "error" });
         navigate("/login");
      } else if (organizerOnly && userType !== "organizer") {
         enqueueSnackbar("Access restricted to organizers", {
            variant: "error",
         });
         navigate("/hackathons");
      }
   }, [navigate, organizerOnly, enqueueSnackbar]);

   return children;
};

export default AuthGuard;
