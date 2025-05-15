import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { acceptInvitation } from "@/lib/api";
import { enqueueSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function VerifyMemberPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState("idle"); // idle | verifying | verified | failed
  const location = useLocation();

  // Prevent right-click and reload keys
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.onbeforeunload = null;
    };
  }, []);

  const handleVerify = async () => {
    setStatus("verifying");
    try {
      const res = await acceptInvitation(token);
      if (res?.success) {
        setStatus("verified");
        enqueueSnackbar(res.message, { variant: "success" });

        // Disable reload
        window.onbeforeunload = () => "Reloading this page is disabled.";
      } else {
        setStatus("failed");
      }
    } catch (err) {
      setStatus("failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-muted">
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center space-y-2">
        {status === "idle" && (
          <>
            <CardTitle className="text-2xl font-semibold">Accept Invitation</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Click the button below to verify your invitation.
            </CardDescription>
          </>
        )}
        {status === "verifying" && (
          <>
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
            <CardTitle className="text-xl font-medium">Verifying...</CardTitle>
          </>
        )}
        {status === "verified" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500" />
            <CardTitle className="text-xl font-bold text-green-500">Successfully Verified!</CardTitle>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="w-12 h-12 text-red-500" />
            <CardTitle className="text-xl font-bold text-red-500">Verification Failed</CardTitle>
          </>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {status === "idle" && (
          <Button onClick={handleVerify}>Accept</Button>
        )}
        {status === "verifying" && (
          <p className="text-muted-foreground">Please wait while we verify your invitation.</p>
        )}
        {status === "verified" && (
          <>
            <CardDescription className="text-center text-muted-foreground">
              You have been added to your team. You may now participate in the hackathon.
            </CardDescription>
            <Button onClick={() => navigate("/")}>Go to Homepage</Button>
          </>
        )}
        {status === "failed" && (
          <>
            <CardDescription className="text-center text-muted-foreground">
              The invitation link is invalid, expired, or has already been used.
            </CardDescription>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  </div>

  );
}
