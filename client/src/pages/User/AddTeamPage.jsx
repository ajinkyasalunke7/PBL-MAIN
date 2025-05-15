import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getHackathonById,
  updateTeamMembers,
  getTeamDetails,
} from "@/lib/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Users, UserCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AddTeamPage() {
  const { team_id, hack_id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [members, setMembers] = useState([]);
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to check if all member fields are filled
  function isFormComplete() {
    return members.length > 0 && members.every(member =>
      member.first_name && member.last_name && member.email && member.college_name && member.gender
    );
  }

  useEffect(() => {
    async function fetchHackathon() {
      try {
        const res = await getHackathonById(hack_id);
        setHackathon(res.data);
        // // console.log(res.data);
        const team_res = await getTeamDetails(team_id);
        setTeamDetails(team_res.data);
        // console.log(team_res.data);
        // console.log(team_res.data.all_members_added);
        const membersCount = Math.max(team_res.data.team_size - 1, 0);

        if (team_res.data.all_members_added && Array.isArray(team_res.data.members)) {
          // Pre-fill members with actual data, skipping the team leader
          const prefilledMembers = team_res.data.members.map(member => ({
            first_name: member.first_name || "",
            last_name: member.last_name || "",
            email: member.email || "",
            college_name: member.college_name || "",
            gender: member.gender || "Male",
          }));
          setMembers(prefilledMembers);
        } else {
          const emptyMember = () => ({
            first_name: "",
            last_name: "",
            email: "",
            college_name: "",
            gender: "Male",
          });
          setMembers(Array.from({ length: membersCount }, emptyMember));
        }
      } catch (error) {
        setError("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    }

    fetchHackathon();
  }, [hack_id, team_id]);

  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateTeamMembers(team_id, { members });
      setSuccess("Team members added successfully!");
      setTimeout(() => navigate(`/update-hackathon/${team_id}/${hack_id}`), 1000);
    } catch (err) {
      setError("Error adding team members. Please check the information and try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Hackathon Found</CardTitle>
            <CardDescription>We couldn't find the hackathon you're looking for.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Add Team Members
        </h1>
        <p className="text-muted-foreground mt-2">
          Build your team for this hackathon by adding members below
        </p>
      </div>

      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Hackathon Details Card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Hackathon Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6">
          <div>
            <Label className="text-xs text-muted-foreground">Hackathon</Label>
            <p className="font-medium mt-1">{hackathon.title}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Dates</Label>
            <p className="mt-1">
              {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max Team Size</Label>
            <p className="mt-1">{hackathon.max_team_size}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Team Leader Card */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <UserCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Team Leader</CardTitle>
            </div>
            <CardDescription>
              You are the team leader for this hackathon
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-6">
            {teamDetails && (
              <>
                <div>
                  <Label htmlFor="leader_first_name">First Name</Label>
                  <Input
                    id="leader_first_name"
                    value={teamDetails.team_leader.first_name}
                    disabled
                    className="mt-1 bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="leader_last_name">Last Name</Label>
                  <Input
                    id="leader_last_name"
                    value={teamDetails.team_leader.last_name}
                    disabled
                    className="mt-1 bg-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="leader_email">Email</Label>
                  <Input
                    id="leader_email"
                    value={teamDetails.team_leader.email}
                    disabled
                    className="mt-1 bg-muted cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Team Members Card */}
        {members.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle>Team Members</CardTitle>
              </div>
              <CardDescription>
                Add up to {hackathon.max_team_size - 1} team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.map((member, index) => (
                <div key={index} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                      {index + 1}
                    </div>
                    <h3 className="font-medium">Team Member {index + 1}</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`first_name_${index}`}>First Name</Label>
                      <Input
                        id={`first_name_${index}`}
                        placeholder="First Name"
                        value={member.first_name}
                        onChange={(e) => handleChange(index, "first_name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`last_name_${index}`}>Last Name</Label>
                      <Input
                        id={`last_name_${index}`}
                        placeholder="Last Name"
                        value={member.last_name}
                        onChange={(e) => handleChange(index, "last_name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`email_${index}`}>Email</Label>
                      <Input
                        id={`email_${index}`}
                        type="email"
                        placeholder="Email Address"
                        value={member.email}
                        onChange={(e) => handleChange(index, "email", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`college_${index}`}>College</Label>
                      <Input
                        id={`college_${index}`}
                        placeholder="College Name"
                        value={member.college_name}
                        onChange={(e) => handleChange(index, "college_name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <Label htmlFor={`gender_${index}`}>Gender</Label>
                    <Select
                      value={member.gender}
                      onValueChange={(value) => handleChange(index, "gender", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {index < members.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-8 sticky bottom-4 sm:relative sm:bottom-auto">
          <Button
            type="submit"
            disabled={submitLoading || !isFormComplete()}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 text-white shadow-md hover:opacity-90"
          >
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Team"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}