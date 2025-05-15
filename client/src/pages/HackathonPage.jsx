import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllHackathons } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Users, Loader, ArrowRight, Trophy } from "lucide-react";
import { getRandomImage } from "@/assets/images";
import { enqueueSnackbar } from "notistack";

export default function HackathonPage() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch hackathons
  useEffect(() => {
    const fetchHackathons = async () => {
      // if(!localStorage.getItem("token")){
      //   navigate("/login");
      //   enqueueSnackbar("Login first", {variant: "default"})
      //   return;
      // }
      try {
        const response = await getAllHackathons();
        //// console.log(response);
        setHackathons(response.data);

      } catch (err) {
        setError("No hackathons present at this moment" || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  // Handle "Check" button click
  const handleCheckHackathon = (hackathonId) => {
    const userType = localStorage.getItem("user_type");
    if (userType === "organizer") {
      navigate(`/organizer/hackathon/${hackathonId}`);
    } else {
      navigate(`/hackathon/${hackathonId}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div>
            <div className="h-8 w-48 bg-muted rounded-md"></div>
            <div className="h-4 w-72 bg-muted rounded-md mt-2"></div>
          </div>
          <div className="h-8 w-8 bg-muted rounded-full"></div>
        </div>

        <div className="h-1 w-full bg-muted rounded my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="h-48 bg-muted"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded-md w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-full"></div>
                  <div className="h-4 bg-muted rounded-md w-5/6"></div>
                </div>
                <div className="h-10 bg-muted rounded-md w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          <div className="flex items-center gap-2">
            <Loader className="animate-spin h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">Loading hackathons...</p>
          </div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hackathons</h1>
          <p className="text-muted-foreground mt-1">Discover and participate in exciting coding challenges</p>
        </div>
        <Trophy className="h-8 w-8 text-primary" />
      </div>

      <Separator className="my-6" />

      {!hackathons || hackathons.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              No active hackathons at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later for upcoming events!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((hackathon) => (
            <Card
              key={hackathon.hackathon_id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getRandomImage()}
                  alt={hackathon.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                /* Fix for white bar */
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end group-hover:from-black/90 transition-colors duration-300">
                  <div className="p-4 text-white w-full">
                    <h3 className="text-xl font-bold mb-1 group-hover:translate-y-[-2px] transition-transform duration-300">{hackathon.title}</h3>
                    <div className="flex flex-wrap gap-2 group-hover:translate-y-[-2px] transition-transform duration-300">
                      <Badge variant="outline" className="bg-white/10 text-white border-none backdrop-blur-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-1">Registration:</span>
                    {new Date(hackathon.registration_start_date).toLocaleDateString()} - {new Date(hackathon.registration_end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-1">Team Size:</span> Up to {hackathon.max_team_size} members
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleCheckHackathon(hackathon.hackathon_id)}
                  className="w-full mt-2 group"
                >
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
