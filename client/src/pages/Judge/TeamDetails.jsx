import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getTeamDetailsForJudge, getProjectScore, submitProjectScore, updateProjectScore } from "@/lib/api";

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [projectScore, setProjectScore] = useState(null);
  const [scoreValue, setScoreValue] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await getTeamDetailsForJudge(teamId);
      setTeam(response.data);

      // If team has a project, check if the judge has already scored it
      if (response.data.Projects && response.data.Projects.length > 0) {
        try {
          const scoreResponse = await getProjectScore(response.data.Projects[0].project_id);
          if (scoreResponse.success) {
            setProjectScore(scoreResponse.data);
            setScoreValue(scoreResponse.data.score);
            setComments(scoreResponse.data.comments || '');
          }
        } catch (scoreError) {
          // It's okay if there's no score yet
          // console.log("No existing score found");
        }
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      enqueueSnackbar(error.message || "Failed to load team details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  console.log

  const handleSubmitScore = async () => {
    if (!team?.Projects || team.Projects.length === 0) {
      enqueueSnackbar("Cannot score a team without a project", { variant: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const scoreData = {
        score: scoreValue,
        comments: comments
      };

      let response;
      if (projectScore) {
        // Update existing score
        response = await updateProjectScore(team.Projects[0].project_id, scoreData);
      } else {
        // Submit new score
        response = await submitProjectScore(team.Projects[0].project_id, scoreData);
      }

      if (response.success) {
        setProjectScore(response.data);
        enqueueSnackbar("Project score " + (projectScore ? "updated" : "submitted") + " successfully", { variant: "success" });
      } else {
        throw new Error(response.message || "Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting project score:", error);
      enqueueSnackbar(error.message || "Failed to submit score", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!team) return <div className="text-center py-8">Team not found or you don't have permission to view it.</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{team.team_name}</h1>
        <Button variant="outline" onClick={() => navigate("/judge/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      {/* Team Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Hackathon: {team.Hackathon?.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p>{team.description || "No description provided"}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Team Members</h3>
              <div className="space-y-2">
                {/* Team Leader */}
                <div className="flex items-center">
                  <div>
                    <p className="font-medium">{team.teamLeader?.first_name} {team.teamLeader?.last_name}</p>
                    <p className="text-sm text-gray-500">{team.teamLeader?.email} (Team Leader)</p>
                  </div>
                </div>

                {/* Other Team Members */}
                {team.TeamMembers?.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <div>
                      <p className="font-medium">{member.User?.first_name} {member.User?.last_name}</p>
                      <p className="text-sm text-gray-500">{member.User?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Info */}
      {team.Projects && team.Projects.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{team.Projects[0].project_name}</CardTitle>
                <CardDescription>Project Status:
                  <Badge className="ml-2" variant={team.project_status === "Submitted" ? "success" : "secondary"}>
                    {team.project_status}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p>{team.Projects[0].description || "No description provided"}</p>
              </div>

              {(team.Projects[0].github_url || team.Projects[0].demo_url) && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Project Links</h3>
                  <div className="space-y-1">
                    {team.Projects[0].github_url && (
                      <p>
                        <span className="font-medium">GitHub:</span>{" "}
                        <a href={team.Projects[0].github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {team.Projects[0].github_url}
                        </a>
                      </p>
                    )}
                    {team.Projects[0].demo_url && (
                      <p>
                        <span className="font-medium">Demo:</span>{" "}
                        <a href={team.Projects[0].demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {team.Projects[0].demo_url}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Project Scoring Section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Project Evaluation</h3>

                {projectScore && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 font-medium">
                      You've already scored this project: {projectScore.score}/10
                    </p>
                    <p className="text-sm text-green-700">
                      You can update your score below if needed.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="score">Score (1-10)</Label>
                      <span className="font-medium">{scoreValue}/10</span>
                    </div>
                    <Slider
                      id="score"
                      min={1}
                      max={10}
                      step={1}
                      value={[scoreValue]}
                      onValueChange={(value) => setScoreValue(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Enter your feedback about the project..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitScore}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : (projectScore ? "Update Score" : "Submit Score")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">This team has not submitted a project yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamDetails;
