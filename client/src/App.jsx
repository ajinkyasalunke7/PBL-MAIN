import { Button } from "@/components/ui/button";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { SnackbarProvider } from "notistack";
import UserRegister from "./pages/User/UserRegister";
import UserLogin from "./pages/User/UserLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import MyHackathon from "./pages/User/MyHackathon";
import Profile from "./pages/User/Profile";
import { setAuthToken } from "@/lib/api";
import { useEffect } from "react";
import NavigationButtons from "./components/NavigationButtons";
import UpdateHackathon from "./pages/User/UpdateHackathon";
import HackathonPage from "./pages/HackathonPage";
import HackathonDetailsPage from "./pages/User/HackathonDetailsPage";
import OrganizerRegister from "./pages/Organizer/OrganizerRegister";
import AddTeamPage from "./pages/User/AddTeamPage";
import VerifyMemberPage from "./pages/VerifyMemberPage";
import OrganizerDashboard from "./pages/Organizer/Dashboard";
import CreateHackathon from "./pages/Organizer/CreateHackathon";
import AddJudge from "./pages/Organizer/AddJudge";
import AddPrize from "./pages/Organizer/AddPrize";
import DeclareWinner from "./pages/Organizer/DeclareWinner";
import HackathonDetails from "@/pages/Organizer/HackathonDetails";
import EditHackathon from "@/pages/Organizer/EditHackathon";
import ManageHackathon from "@/pages/Organizer/ManageHackathon";
import JudgeDashboard from "@/pages/Judge/JudgeDashboard";
import TeamDetails from "@/pages/Judge/TeamDetails";
import About from "./pages/About";

function App() {
  const location = useLocation();
  const { pathname } = location;

  // Set auth token on app mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Check if user is trying to access auth pages while logged in
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/org/register";
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("user_type");

  if (isAuthPage && token) {
    const targetPath =
      userType === "organizer" ? "/organizer/dashboard" : "/hackathons";
    return <Navigate to={targetPath} replace />;
  }

  return (
    <SnackbarProvider maxSnack={5}>
      <Navbar />
      <div className="m-5">
        {pathname === "/" ? null : <NavigationButtons />}
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* User auth pages */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* Public routes */}
          <Route path="/hackathons" element={<HackathonPage />} />
          <Route path="/org/register" element={<OrganizerRegister />} />

          {/* Protected User Routes */}
          <Route
            path="/my-hackathons"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <MyHackathon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:user_id"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hackathon/:id"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <HackathonDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-hackathon/:team_id/:hack_id"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <UpdateHackathon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-team/:hack_id/:team_id"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <AddTeamPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Organizer Routes */}
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/hackathon/:id/add-judge"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <AddJudge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/hackathon/:id/manage"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <ManageHackathon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/hackathon/:id"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <HackathonDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create-hackathon"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <CreateHackathon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/add-judge"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <AddJudge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/add-prize"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <AddPrize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/declare-winner"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <DeclareWinner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/edit-hackathon/:id"
            element={
              <ProtectedRoute allowedUserTypes={["organizer"]}>
                <EditHackathon />
              </ProtectedRoute>
            }
          />

          {/* Judge Routes */}
          <Route
            path="/judge/dashboard"
            element={<JudgeDashboard />}
          />
          <Route
            path="/judge/teams/:teamId"
            element={<TeamDetails />}
          />

          {/* Common routes */}
          <Route path="/verify-member/:token" element={<VerifyMemberPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>

      {/* NavigationButtons should be outside of the Routes */}

    </SnackbarProvider>
  );
}

export default App;
