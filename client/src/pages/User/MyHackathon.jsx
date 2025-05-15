import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getEnrolledHackathons } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Loader } from "lucide-react";
import { format } from "date-fns";
import { getRandomImage } from "../../assets/images";

export default function MyHackathon() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback to memoize and reuse the fetch function if needed
  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEnrolledHackathons();
      if (response?.success) {
        setHackathons(response.data || []);
      } else {
        console.error("Failed to load hackathons:", response?.message || "Unknown error");
        setHackathons([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (hackathons.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Hackathons</h1>
        <p className="text-center mt-10 text-gray-500">
          No enrolled hackathons found.
        </p>
        <div className="flex justify-center mt-4">
          <Button onClick={() => navigate("/hackathons")}>
            Browse Hackathons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Hackathons</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {hackathons.map((hack) => (
          <div
            key={hack.hackathon_id}
            className="bg-white rounded-2xl shadow-md overflow-hidden border"
          >
            <img
              src={getRandomImage()}
              alt={hack.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{hack.title}</h2>
              <p className="text-sm text-muted-foreground">
                Team size: up to {hack.max_team_size}
              </p>
              <p className="text-sm text-muted-foreground">
                Starts: {format(new Date(hack.start_date), "PPPp")}
              </p>
              <p className="text-sm text-muted-foreground">
                Ends: {format(new Date(hack.end_date), "PPPp")}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/hackathon/${hack.hackathon_id}`)}
                >
                  View Details
                </Button>
                {hack.teams?.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/update-hackathon/${hack.teams[0].team_id}/${hack.hackathon_id}`)
                    }
                  >
                    Update Team
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
