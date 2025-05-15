import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeamDetails, resendInvitation, submitProject } from "../../lib/api";
import { enqueueSnackbar } from "notistack";

// UI Components
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Loader,
  Mail,
  Users,
  Calendar,
  Code,
  FileCode,
  ChevronLeft,
  Info
} from "lucide-react";

export default function UpdateHackathon() {
  const { team_id, hack_id } = useParams();
  const navigate = useNavigate();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Project submission form state
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const teamDetailsResponse = await getTeamDetails(team_id);
        if (!teamDetailsResponse.success) {
          throw new Error(teamDetailsResponse.message || "Failed to load team details");
        }
        setTeamDetails(teamDetailsResponse.data);
      } catch (err) {
        setError(err.message || "Failed to load team details");
        enqueueSnackbar(err.message || "Failed to load team details", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [team_id]);

  const handleResendEmail = async (memberId) => {
    try {
      await resendInvitation(teamDetails.team_id, memberId);
      enqueueSnackbar("Invitation resent successfully!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Failed to resend the invitation. Please try again.", {
        variant: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      team_id: teamDetails.team_id,
      project_name: projectName,
      description,
      github_url: githubUrl,
      demo_url: demoUrl,
    };

    try {
      const response = await submitProject(payload);
      if (!response.success) {
        throw new Error(response.message || "Submission failed");
      }
      enqueueSnackbar("Project submitted successfully!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Team Found</CardTitle>
            <CardDescription>No team found for this hackathon.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const allVerified = teamDetails.members.every((m) => m.verified);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Team Dashboard
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Manage your team and submit your project
        </p>
      </div>

      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="details">Team Details</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="project">Project Submission</TabsTrigger>
        </TabsList>

        {/* Team Details Tab */}
        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Team Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-sm text-muted-foreground">Team Name</div>
                  <div className="text-sm font-medium">{teamDetails.team_name}</div>

                  <div className="text-sm text-muted-foreground">Team ID</div>
                  <div className="text-sm font-medium text-primary">{teamDetails.team_id}</div>

                  <div className="text-sm text-muted-foreground">Team Leader</div>
                  <div className="text-sm font-medium">
                    {teamDetails.team_leader.first_name} {teamDetails.team_leader.last_name}
                  </div>

                  <div className="text-sm text-muted-foreground">Team Size</div>
                  <div className="text-sm font-medium">{teamDetails.team_size}</div>

                  <div className="text-sm text-muted-foreground">Project Status</div>
                  <div>
                    <Badge variant="outline" className={`bg-${teamDetails.project_status === "Submitted" ? "green" : "red"}-100 text-${teamDetails.project_status === "Submitted" ? "green" : "red"}-800 hover:bg-${teamDetails.project_status === "Submitted" ? "green" : "red"}-200`}>
                      {teamDetails.project_status}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">Topic</div>
                  <div>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      {teamDetails.topic_title}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-sm">{teamDetails.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>Hackathon Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Title</div>
                  <h3 className="font-semibold">{teamDetails.hackathon.title}</h3>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-sm">{teamDetails.hackathon.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="text-sm">{new Date(teamDetails.hackathon.start_date).toLocaleString()}</div>

                  <div className="text-sm text-muted-foreground">End Date</div>
                  <div className="text-sm">{new Date(teamDetails.hackathon.end_date).toLocaleString()}</div>

                  <div className="text-sm text-muted-foreground">Max Team Size</div>
                  <div className="text-sm">{teamDetails.hackathon.max_team_size}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>Team Members</CardTitle>
                <div className="ml-auto">
                  <Badge variant="outline">
                    {teamDetails.members.length} / {teamDetails.hackathon.max_team_size}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {teamDetails.members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members in the team yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {teamDetails.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 rounded-lg bg-accent/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500">
                          <AvatarFallback>
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={member.verified ? "success" : "destructive"}
                          className={member.verified ?
                            "bg-green-100 text-green-800 hover:bg-green-200" :
                            "bg-red-100 text-red-800 hover:bg-red-200"}
                        >
                          {member.verified ? "Verified" : "Not Verified"}
                        </Badge>
                        {!member.verified && (
                          <Button
                            onClick={() => handleResendEmail(member.user_id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Resend</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Submission Tab */}
        <TabsContent value="project">
          {teamDetails.project ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <FileCode className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Project Details</CardTitle>
                </div>
                <CardDescription>
                  Your project has been submitted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Project Name</div>
                  <h3 className="text-xl font-semibold">{teamDetails.project.project_name}</h3>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <p>{teamDetails.project.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">GitHub URL</div>
                    <a
                      href={teamDetails.project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                    >
                      <Code className="h-4 w-4 flex-shrink-0" />
                      <span className="overflow-hidden text-ellipsis">{teamDetails.project.github_url}</span>
                    </a>
                  </div>

                  {teamDetails.project.demo_url && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Demo URL</div>
                      <a
                        href={teamDetails.project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileCode className="h-4 w-4" />
                        {teamDetails.project.demo_url}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <FileCode className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Project Submission</CardTitle>
                </div>
                <CardDescription>
                  Submit your project details for the hackathon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allVerified ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="projectName" className="text-sm font-medium">
                          Project Name
                        </label>
                        <Input
                          id="projectName"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="githubUrl" className="text-sm font-medium">
                          GitHub URL
                        </label>
                        <Input
                          id="githubUrl"
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username/project"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Project Description
                      </label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your project"
                        className="min-h-32"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="demoUrl" className="text-sm font-medium">
                        Demo URL (optional)
                      </label>
                      <Input
                        id="demoUrl"
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://your-demo-url.com"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-md"
                      >
                        Submit Project
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <Info className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <p>All team members must be verified before submitting your project.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}