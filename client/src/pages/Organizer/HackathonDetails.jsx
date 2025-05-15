import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getOrganizerHackathonById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, Settings } from "lucide-react";

export default function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);

  useEffect(() => {
    fetchHackathonDetails();
  }, [id]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrganizerHackathonById(id);
      setHackathon(data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch hackathon details", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">Hackathon not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{hackathon.name}</h1>
        <div className="flex gap-2">
          {getStatusBadge(hackathon.status)}
          <Button
            variant="outline"
            onClick={() => navigate(`/hackathon/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{hackathon.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(hackathon.start_date).toLocaleDateString()} -{" "}
                {new Date(hackathon.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Max Team Size: {hackathon.max_team_size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Participants: {hackathon.participant_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(hackathon.registration_start).toLocaleDateString()} -{" "}
                {new Date(hackathon.registration_end).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {hackathon.teams?.length > 0 ? (
              <div className="space-y-4">
                {hackathon.teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-gray-500">
                      Members: {team.members?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No teams registered yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
