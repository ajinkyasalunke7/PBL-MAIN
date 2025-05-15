import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getOrganizerHackathonById,
  getHackathonTeams,
  getHackathonJudges,
  getHackathonPrizes,
  addTopicsToHackathon,
  addPrize,
  getAllJudges,
  assignJudge,
  resendInvitation,
  declareWinner,
} from "@/lib/api";

const ManageHackathon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [judgeAssignments, setJudgeAssignments] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", description: "" });
  const [newPrize, setNewPrize] = useState({
    prize_name: "",
    description: "",
    position: "",
  });
  const [topicsToAdd, setTopicsToAdd] = useState([]);
  // Track selected team for each prize
  const [selectedPrizeTeams, setSelectedPrizeTeams] = useState({});
  // State for judge assignment
  const [selectedJudgeId, setSelectedJudgeId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Tab state persistence
  const LOCAL_STORAGE_TAB_KEY = `manage_hackathon_tab_${id}`;
  const [activeTab, setActiveTab] = useState(() => {
    // On mount, get tab from localStorage or default to 'teams'
    return localStorage.getItem(LOCAL_STORAGE_TAB_KEY) || 'teams';
  });

  useEffect(() => {
    fetchHackathonDetails();
  }, [id]);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, activeTab);
  }, [activeTab, LOCAL_STORAGE_TAB_KEY]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      const [hackathonData, teamsData, judgesData, prizesData] =
        await Promise.all([
          getOrganizerHackathonById(id),
          getHackathonTeams(id),
          getAllJudges(),
          getHackathonPrizes(id),
        ]);

      setHackathon(hackathonData.data);
      // Check if teams data is in the expected format and format if needed
      // Normalize teams to always have team_id and team_name
      const rawTeams = Array.isArray(teamsData.teams) ? teamsData.teams : teamsData.data || [];
      const normalizedTeams = rawTeams.map(team => ({
        team_id: team.team_id || team.id,
        team_name: team.team_name,
        ...team
      }));
      setTeams(normalizedTeams);
      setJudges(judgesData.data || []);
      setPrizes(prizesData.data || []);

      // Fetch judge assignments separately
      await fetchJudgeAssignments();
    } catch (error) {
      console.error("Error fetching hackathon details:", error);
      enqueueSnackbar(error.message || "Failed to fetch hackathon details", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJudgeAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await getHackathonJudges(id);
      setJudgeAssignments(response.data || []);
    } catch (error) {
      console.error("Error fetching judge assignments:", error);
      enqueueSnackbar("Failed to load judge assignments", { variant: "error" });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setIsTeamDialogOpen(true);
  };



  // Add topic to local array
  const handleAddTopicToArray = () => {
    if (!newTopic.title.trim()) {
      enqueueSnackbar("Topic title is required", { variant: "error" });
      return;
    }
    setTopicsToAdd([...topicsToAdd, newTopic]);
    setNewTopic({ title: "", description: "" });
  };

  // Remove topic from array
  const handleRemoveTopicFromArray = (index) => {
    setTopicsToAdd(topicsToAdd.filter((_, i) => i !== index));
  };

  // Submit all topics in array
  const handleSubmitTopics = async () => {
    if (topicsToAdd.length === 0) {
      enqueueSnackbar("Add at least one topic before submitting.", { variant: "error" });
      return;
    }
    try {
      await addTopicsToHackathon(id, topicsToAdd);
      enqueueSnackbar("Topics added successfully", { variant: "success" });
      setTopicsToAdd([]);
      fetchHackathonDetails();
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to add topics", { variant: "error" });
    }
  };

  const handleAddPrize = async () => {
    try {
      const response = await addPrize(id, newPrize);
      enqueueSnackbar("Prize added successfully", { variant: "success" });
      setNewPrize({ name: "", description: "", position: "" });
      fetchHackathonDetails();
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to add prize", {
        variant: "error",
      });
    }
  };

  const handleAssignJudge = async () => {
    if (!selectedJudgeId || !selectedTeamId) {
      enqueueSnackbar('Please select both a judge and a team', { variant: 'warning' });
      return;
    }

    try {
      await assignJudge(id, selectedTeamId, selectedJudgeId);
      enqueueSnackbar('Judge assigned to team successfully', { variant: 'success' });

      // Reset selection fields
      setSelectedJudgeId('');
      setSelectedTeamId('');

      // Refresh judge assignments
      await fetchJudgeAssignments();
    } catch (error) {
      console.error('Error assigning judge:', error);
      enqueueSnackbar(error.message || 'Failed to assign judge to team', { variant: 'error' });
    }
  };

  const handleDeclareWinner = async (prizeId, teamId) => {
    if (!teamId || isNaN(Number(teamId))) {
      enqueueSnackbar('Please select a valid team', { variant: 'warning' });
      return;
    }
    const teamIdNum = Number(teamId);
    // console.log('Declaring winner with prizeId:', prizeId, 'teamId:', teamIdNum, 'type:', typeof teamIdNum);
    try {
      await declareWinner(id, prizeId, teamIdNum);
      enqueueSnackbar('Winner declared successfully', { variant: 'success' });

      // Reset the selected team for this prize
      setSelectedPrizeTeams(prev => ({
        ...prev,
        [prizeId]: ''
      }));

      // Refresh prizes to show the winner
      const prizesData = await getHackathonPrizes(id);
      setPrizes(prizesData.data || []);
    } catch (error) {
      console.error('Error declaring winner:', error);
      enqueueSnackbar(error.message || 'Failed to declare winner', { variant: 'error' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage {hackathon?.title}</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/organizer/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
          <TabsTrigger value="prizes">Prizes</TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <div className="bg-white rounded-lg shadow p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Project Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.team_name}</TableCell>
                    <TableCell>
                      <span className={
                        team.topic_title && team.topic_title !== "null"
                          ? "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold"
                          : "bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-semibold"
                      }>
                        {team.topic_title || "No Topic"}
                      </span>
                    </TableCell>
                    <TableCell>{team.team_size} members</TableCell>
                    <TableCell>
                      <Badge
                        variant={team.project_status === "Submitted" ? "success" : "destructive"}
                        className={team.project_status === "Submitted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {team.project_status || "Not submitted"}
                      </Badge>
                    </TableCell>
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
        </TabsContent>

        <TabsContent value="topics">
          <div className="space-y-6">
            {/* Preview for topics to add */}
            {topicsToAdd.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {topicsToAdd.map((topic, idx) => (
                  <span key={idx} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow-sm">
                    <span className="mr-2 font-semibold">{topic.title}</span>
                    <button
                      className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleRemoveTopicFromArray(idx)}
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Add New Topic</h3>
              <Input
                placeholder="Topic Title"
                className="mb-3"
                value={newTopic.title}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, title: e.target.value })
                }
              />
              <Textarea
                className="mb-3"
                placeholder="Topic Description"
                value={newTopic.description}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, description: e.target.value })
                }
              />
              <div className="flex gap-2 mt-3">
                <Button onClick={handleAddTopicToArray} className="bg-primary hover:bg-primary/90">Add</Button>
                <Button variant="secondary" onClick={handleSubmitTopics}>Submit</Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Current Topics</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hackathon?.Topics?.map((topic) => (
                    <TableRow key={topic.topic_id}>
                      <TableCell className="font-semibold text-gray-900">{topic.title}</TableCell>
                      <TableCell className="text-gray-700">{topic.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="judges">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Assign Judges</h3>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate(`/organizer/hackathon/${id}/add-judge`)}
              >
                Add Judge
              </Button>
            </div>

            {/* Judge Assignment Section */}
            <div className="mb-8 p-6 border rounded-xl bg-gray-50">
              <h4 className="text-lg font-semibold mb-4">Assign Judge to Team</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Judge</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedJudgeId || ""}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                  >
                    <option value="">Select a Judge</option>
                    {judges?.map((judge) => (
                      <option key={judge.user_id} value={judge.user_id}>
                        {judge.first_name} {judge.last_name} ({judge.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select Team</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedTeamId || ""}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                  >
                    <option value="">Select a Team</option>
                    {teams?.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                onClick={handleAssignJudge}
                disabled={!selectedJudgeId || !selectedTeamId}
                className="bg-primary hover:bg-primary/90 w-full md:w-auto mt-2"
              >
                Assign Judge to Team
              </Button>
            </div>

            {/* Current Judge Assignments */}
            <h4 className="text-lg font-semibold mb-4">Current Judge Assignments</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judge</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAssignments ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading assignments...
                    </TableCell>
                  </TableRow>
                ) : judgeAssignments?.length > 0 ? (
                  judgeAssignments.map((assignment) => (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-semibold text-gray-900">
                        {assignment.judge.first_name} {assignment.judge.last_name}
                      </TableCell>
                      <TableCell className="text-gray-700">{assignment.team?.team_name}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === 'accepted' ? 'success' :
                          assignment.status === 'rejected' ? 'destructive' : 'secondary'}
                          className={assignment.status === 'accepted' ? 'bg-green-100 text-green-800' : assignment.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No judge assignments yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="prizes">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-primary">Add New Prize</h3>
              <Input
                className="mb-3"
                placeholder="Prize Name"
                value={newPrize.prize_name}
                onChange={(e) =>
                  setNewPrize({ ...newPrize, prize_name: e.target.value })
                }
              />
              <Textarea
                className={"mt-3"}
                placeholder="Prize Description"
                value={newPrize.description}
                onChange={(e) =>
                  setNewPrize({ ...newPrize, description: e.target.value })
                }
              />
              <Input
                className={"mt-3"}
                type="number"
                placeholder="Position"
                value={newPrize.position}
                onChange={(e) =>
                  setNewPrize({ ...newPrize, position: e.target.value })
                }
              />
              <Button className={"mt-3"} onClick={handleAddPrize}>
                Add Prize
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Current Prizes</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.map((prize) => (
                    <TableRow key={prize.prize_id}>
                      <TableCell>{prize.prize_name}</TableCell>
                      <TableCell>{prize.description}</TableCell>
                      <TableCell>{prize.position}</TableCell>
                      <TableCell>
                        {prize.winner ? (
                          <span>{prize.winner.team_name}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              className="border rounded px-2 py-1"
                              value={selectedPrizeTeams[prize.prize_id] || ""}
                              onChange={e => {
                                const value = e.target.value;
                                setSelectedPrizeTeams(prev => {
                                  const newState = {
                                    ...prev,
                                    [prize.prize_id]: value === "" ? "" : Number(value)
                                  };
                                  // console.log('Updated selectedPrizeTeams:', newState);
                                  return newState;
                                });
                              }}
                            >
                              <option value="">Select Team</option>
                              {teams.map(team => (
                                <option key={team.team_id} value={team.team_id}>
                                  {team.team_name}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleDeclareWinner(
                                  prize.prize_id,
                                  selectedPrizeTeams[prize.prize_id]
                                )
                              }
                            >
                              Declare Winner
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedTeam && (
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent className="w-full max-w-[90vw] md:max-w-5xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>

              <DialogTitle>Team Members - {selectedTeam.team_name}</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <Table className="mt-4 min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead>Action</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody className={""}>
                  {selectedTeam.members.map((member, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <TableCell className="py-3 px-4 text-base whitespace-nowrap">
                        {member.first_name + " " + member.last_name}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base whitespace-nowrap">
                        {member.email}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-base whitespace-nowrap">
                        <Badge className={member.role === "Team Leader" ? "bg-blue-200 text-black-800" : "bg-black text-white"}>{member.role}</Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge
                          variant={member.verified === true ? "success" : "destructive"}
                          className={
                            (member.verified === true ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800") +
                            " px-3 py-1 rounded-full text-sm font-semibold mx-auto"
                          }
                        >
                          {member.verified === true ? "Verified" : "Not Verified"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        {/* {JSON.stringify(member.verified)} */}
                        {member.verified === false ? (
                          <Button variant="outline" onClick={() => resendInvitation(selectedTeam.id, member.id)}>
                            Send Invitation
                          </Button>
                        ) :
                          <Button variant="outline" disabled>
                            Disabled
                          </Button>
                        }
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
};

export default ManageHackathon;
