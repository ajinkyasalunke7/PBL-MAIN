import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHackathonById,
  getHackathonTopics,
  enrollInHackathon,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Loader, CheckCircle } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { getRandomImage } from "@/assets/images";

export default function HackathonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [bannerImage, setBannerImage] = useState(() => getRandomImage());
  const [enrollmentData, setEnrollmentData] = useState({
    hackathon_id: Number(id),
    team_name: "",
    description: "",
    team_size: 3,
    topic_id: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the hackathon details and topics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hackathonResponse, topicsResponse] = await Promise.all([
          getHackathonById(id),
          getHackathonTopics(id),
        ]);
        setHackathon(hackathonResponse.data);
        setTopics(topicsResponse.data);
        setIsAlreadyEnrolled(Boolean(hackathonResponse.user_already_enrolled));
        setTeamId(hackathonResponse.team_id);
        setHackathon((prev) => ({ ...prev, members_added: hackathonResponse.members_added }));
        // console.log(hackathon)
      } catch (err) {
        setError("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle topic selection
  const handleTopicSelect = (value) => {
    setEnrollmentData((prev) => ({
      ...prev,
      topic_id: value,
    }));
  };

  // Handle form submission to enroll in the hackathon
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentData.topic_id) {
      enqueueSnackbar("Please select a topic", { variant: "error" });
      return;
    }
    setIsSubmitting(true);

    try {
      // console.log(enrollmentData.topic_id);
      const response = await enrollInHackathon({
        hackathon_id: enrollmentData.hackathon_id,
        team_name: enrollmentData.team_name,
        description: enrollmentData.description,
        team_size: enrollmentData.team_size,
        topic_id: enrollmentData.topic_id,
      });
      navigate(`/add-team/${id}/${response.data.team_id}`);
      // console.log(enrollmentData);
    } catch (err) {
      const message = err?.message || "Failed to enroll in hackathon";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {hackathon && (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden">
            <img src={bannerImage} className="w-full h-64 object-cover" alt="Hackathon banner" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="bg-white/10 text-md text-white border-none">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-md text-white border-none">
                    <Users className="w-3 h-3 mr-1" />
                    Max Team: {hackathon.max_team_size}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>About this Hackathon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {hackathon.description || "No description available."}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-2 border-t pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium mr-1">Event Period:</span>
                {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium mr-1">Registration Period:</span>
                {new Date(hackathon.registration_start_date).toLocaleDateString()} - {new Date(hackathon.registration_end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-medium mr-1">Team Size Limit:</span> {hackathon.max_team_size} members
              </div>
            </CardFooter>
          </Card>

          {/* Enrollment Section */}
          {isAlreadyEnrolled ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center"> {/* Container for icon and text */}
                  <CheckCircle className="text-green-600 w-5 h-5 mr-2" />
                  <p className="text-green-700 font-medium">You are already enrolled in this hackathon.</p>
                </div>
                <div className="space-x-3">
                  <Button variant="outline" onClick={() => navigate(`/update-hackathon/${teamId}/${id}`)}>
                    Manage Hackathon
                  </Button>
                  {!hackathon.members_added && (
                    <Button variant="outline" onClick={() => navigate(`/add-team/${id}/${teamId}`)}>
                      Add Team
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enroll Your Team</CardTitle>
                <CardDescription>Complete the form below to register your team for this hackathon</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="team_name">Team Name</Label>
                      <Input
                        id="team_name"
                        name="team_name"
                        value={enrollmentData.team_name}
                        onChange={handleInputChange}
                        placeholder="Enter your team name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={enrollmentData.description}
                        onChange={handleInputChange}
                        placeholder="Briefly describe your team and project idea"
                        className="mt-1 resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="team_size">Team Size</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Input
                                  type="number"
                                  id="team_size"
                                  name="team_size"
                                  value={enrollmentData.team_size}
                                  onChange={handleInputChange}
                                  max={hackathon.max_team_size}
                                  className="mt-1"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Maximum allowed: {hackathon.max_team_size}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div>
                        <Label htmlFor="topic">Select Topic</Label>
                        <Select
                          value={enrollmentData.topic_id}
                          onValueChange={handleTopicSelect}
                          required
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            {topics.length === 0 ? (
                              <SelectItem value="no">No topics available</SelectItem>
                            ) : (
                              topics.map((topic) => (
                                <SelectItem
                                  key={topic.topic_id}
                                  value={String(topic.topic_id)}
                                >
                                  {topic.title}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
