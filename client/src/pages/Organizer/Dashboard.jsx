import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  getOrganizerHackathons,
  getHackathonParticipants,
  getHackathonTeams,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { getRandomImage } from "@/assets/images";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  Calendar,
  Settings,
  ArrowRight,
  FileText,
  Trophy,
  Copy,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response = await getOrganizerHackathons();
      if (response.success) {
        setHackathons(response.hackathons || []);
      } else {
        enqueueSnackbar("Failed to fetch hackathons", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch hackathons", { variant: "error" });
    } finally {
      setLoading(false);
      // // console.log(hackathon);
    }
  };

  const handleManageHackathon = (hackathon) => {
    navigate(`/hackathon/${hackathon.id}/manage`);
  };

  const handleViewTeam = async (team) => {
    setSelectedTeam(team);
    setIsTeamDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "bg-green-500",
      upcoming: "bg-blue-500",
      completed: "bg-gray-500",
    };
    return (
      <Badge className={`${statusColors[status]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.start_date);
    const endDate = new Date(hackathon.end_date);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    return "active";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Hackathons</h1>
        <Button onClick={() => navigate("/organizer/create-hackathon")}>
          Create New Hackathon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <Card
            key={hackathon.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={getRandomImage()}
                alt={hackathon.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{hackathon.title}</CardTitle>
                  <CardDescription className="text-sm overflow-hidden text-ellipsis line-clamp-3 mt-3">
                    {hackathon.description}
                  </CardDescription>
                </div>
                <div className="flex gap-5 items-center">
                  {getStatusBadge(getHackathonStatus(hackathon))}
                  <button
                    className="focus:bg-gray-200 hover:bg-gray-200 p-3  rounded-full transition-colors"
                    onClick={() => {
                      const url = `${import.meta.env.VITE_APP_URL}/hackathon/${
                        hackathon.id
                      }`;

                      const copyToClipboard = (text) => {
                        // Create temporary input element
                        const tempInput = document.createElement("input");
                        tempInput.setAttribute("type", "text");
                        tempInput.setAttribute("display", "none");
                        tempInput.setAttribute("value", text);
                        document.body.appendChild(tempInput);

                        // Select and copy
                        tempInput.select();
                        let success = false;
                        try {
                          success = document.execCommand("copy");
                        } catch (err) {
                          console.error("Failed to copy: ", err);
                        }

                        // Clean up
                        document.body.removeChild(tempInput);
                        return success;
                      };

                      // Try to copy and show appropriate notification
                      if (copyToClipboard(url)) {
                        enqueueSnackbar("Link copied to clipboard", {
                          variant: "success",
                          icon: <CheckCircle className="h-4 w-4" />,
                        });
                      } else {
                        enqueueSnackbar("Failed to copy link", {
                          variant: "error",
                        });
                      }
                    }}
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {/* <Badge >Copy Link</Badge> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                    {new Date(hackathon.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{hackathon.total_team_count} teams</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4">
              <div className="space-x-4">
                <Button
                  variant="default"
                  onClick={() =>
                    navigate(`/organizer/hackathon/${hackathon.id}/manage`)
                  }
                >
                  Manage
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigate(`/organizer/edit-hackathon/${hackathon.id}`)
                  }
                >
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedHackathon && (
        <Dialog
          open={!!selectedHackathon}
          onOpenChange={() => setSelectedHackathon(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage {selectedHackathon.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-4">Enrolled Teams</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Project Title</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell>
                        {team.Project?.project_name || "No project submitted"}
                      </TableCell>
                      <TableCell>{team.team_size} members</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleViewTeam(team)}
                        >
                          View Members
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedTeam && (
        <Dialog
          open={isTeamDialogOpen}
          onOpenChange={() => setIsTeamDialogOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Team Members - {selectedTeam.team_name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.first_name} {member.last_name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            member.verified ? "bg-green-500" : "bg-yellow-500"
                          }
                        >
                          {member.verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
