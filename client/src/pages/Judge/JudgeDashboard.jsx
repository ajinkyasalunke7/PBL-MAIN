import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getJudgeProfile, getJudgeAssignments, updateAssignmentStatus } from "@/lib/api";

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchJudgeData();
  }, []);

  const fetchJudgeData = async () => {
    try {
      setLoading(true);
      const [profileData, assignmentsData] = await Promise.all([
        getJudgeProfile(),
        getJudgeAssignments()
      ]);

      setProfile(profileData.data);
      setAssignments(assignmentsData.data);
    } catch (error) {
      console.error("Error fetching judge data:", error);
      enqueueSnackbar(error.message || "Failed to load judge dashboard", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (assignmentId, status) => {
    try {
      await updateAssignmentStatus(assignmentId, status);
      enqueueSnackbar(`Assignment ${status} successfully`, { variant: "success" });
      
      // Update local state
      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status } 
          : assignment
      ));
    } catch (error) {
      console.error("Error updating assignment status:", error);
      enqueueSnackbar(error.message || "Failed to update assignment status", { variant: "error" });
    }
  };

  const handleViewTeam = (teamId) => {
    navigate(`/judge/teams/${teamId}`);
  };

  // Filter assignments based on active tab
  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === "all") return true;
    return assignment.status === activeTab;
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Judge Dashboard</h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Judge Profile</CardTitle>
          <CardDescription>Your judge account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {profile?.first_name} {profile?.last_name}</p>
            <p><span className="font-medium">Email:</span> {profile?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <h2 className="text-2xl font-semibold mb-4">Your Team Assignments</h2>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No assignments found</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{assignment.Team?.team_name}</CardTitle>
                      <CardDescription>
                        Hackathon: {assignment.Hackathon?.title}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={assignment.status === 'accepted' ? 'success' : 
                              assignment.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Team Leader:</span> {assignment.Team?.teamLeader?.first_name} {assignment.Team?.teamLeader?.last_name}
                  </p>
                  {assignment.Team?.Project && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Project:</span> {assignment.Team.Project.title}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Assigned:</span> {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    {assignment.status === 'pending' && (
                      <div className="space-x-2">
                        <Button 
                          variant="default" 
                          onClick={() => handleStatusChange(assignment.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleStatusChange(assignment.id, 'rejected')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleViewTeam(assignment.Team?.team_id)}
                  >
                    View Team
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JudgeDashboard;
