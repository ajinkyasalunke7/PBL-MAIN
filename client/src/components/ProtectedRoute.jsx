// Update client/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function ProtectedRoute({ children, allowedUserTypes = [] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get user type from localStorage as fallback
  const userType = user.user_type || localStorage.getItem("user_type");

  // If no allowed user types specified, allow all authenticated users
  if (allowedUserTypes.length === 0) {
    return children;
  }

  // // Check if user type is allowed for this route
  // if (!allowedUserTypes.includes(userType)) {
  //   // Redirect to appropriate dashboard based on user type
  //   const redirectPath =
  //     userType === "organizer" ? "/organizer/dashboard" : "/zhackathons";
  //   return <Navigate to={redirectPath} replace />;
  // }

  // If all checks pass, render the protected content
  return children;
}
