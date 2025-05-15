import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getHackathonTeams,
  declareWinner,
  getHackathonPrizes,
} from "@/lib/api";

export default function DeclareWinnerPage() {
  const { hackathon_id } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPrize, setSelectedPrize] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const loadTeamsAndPrizes = async () => {
      try {
        // Fetch teams
        const teamsData = await getHackathonTeams(hackathon_id);
        setTeams(teamsData.data);

        // Fetch prizes
        const prizesData = await getHackathonPrizes(hackathon_id);
        setPrizes(prizesData.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTeamsAndPrizes();
  }, [hackathon_id]);

  const handleSubmit = async () => {
    if (!selectedTeam || !selectedPrize) {
      setError("Please select both a team and a prize!");
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await declareWinner(
        hackathon_id,
        selectedPrize,
        selectedTeam
      );

      if (response.success) {
        setSuccessMessage("Winner declared successfully!");
        setTimeout(() => navigate("/organizer/dashboard"), 1500);
      } else {
        setError(response.message || "Failed to declare winner.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while declaring winner.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-semibold mb-4">Declare Winner</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}

      {loading ? (
        <p>Loading teams and prizes...</p>
      ) : (
        <>
          {teams.length === 0 ? (
            <p>No teams found for this hackathon.</p>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 dark:text-gray-200">
                  Select Winner Team:
                </span>
                <select
                  className="w-full bg-white text-black dark:bg-gray-800 dark:text-white mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">-- Select a Team --</option>
                  {teams.map((team) => (
                    <option key={team.team_id} value={team.team_id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-gray-700 dark:text-gray-200">
                  Select Prize:
                </span>
                <select
                  className="w-full bg-white text-black dark:bg-gray-800 dark:text-white mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedPrize}
                  onChange={(e) => setSelectedPrize(e.target.value)}
                >
                  <option value="">-- Select a Prize --</option>
                  {prizes.map((prize) => (
                    <option key={prize.prize_id} value={prize.prize_id}>
                      {prize.prize_name} {/* Display the prize name */}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                className="bg-blue-600 text-white"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? "Declaring..." : "Declare Winner"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
