import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { changePassword, getProfile, getUserProfileById } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  User,
  Calendar,
  Award,
  Loader,
  GraduationCap,
  School,
  Users,
  Lock,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  UserCog,
} from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Password Change Dialog Component
function ChangePasswordDialog() {
  const [passwords, setPasswords] = useState({
    currentPassword: "123456",
    newPassword: "qwerty",
    confirmPassword: "qwerty",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      enqueueSnackbar("New passwords do not match", { variant: "error" });
      return;
    }
    try {
      setLoading(true);
      const response = await changePassword(passwords);
      if (response.success) {
        enqueueSnackbar("Password changed successfully", { variant: "success" });
      }
      if (response.success === false) {
        enqueueSnackbar(response.message, { variant: "error" });
      }
      // // console.log(response);
    } catch (error) {
      enqueueSnackbar("Failed to change password", { variant: "error" });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4 w-full">
          <Lock className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            {loading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Profile() {
  const { user_id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = user_id
          ? await getUserProfileById(user_id)
          : await getProfile();
        // // console.log(response);
        if (response.success) {
          setProfile(response.data);
          setIsCurrentUser(!user_id || (response.data.user && response.data.user.user_id.toString() === user_id));
        } else {
          setError("Failed to load profile");
          enqueueSnackbar("Failed to load profile", { variant: "error" });
        }
      } catch (err) {
        setError("Failed to load profile");
        enqueueSnackbar("Failed to load profile", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
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
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {profile && (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Section */}
            <Card className="w-full md:w-1/3">
              <CardHeader className="items-center justify-center justify-items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {profile.user.first_name?.[0]}
                    {profile.user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {profile.user.first_name} {profile.user.last_name}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profile.user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 max-w-full">
                  <School size={20} className="text-muted-foreground shrink-0" />
                  <span className="text-sm truncate" title={profile.user.college_name}>
                    {profile.user.college_name}
                  </span>
                </div>

                {/* <div className="flex items-center gap-2">
                  <User size={20} className="text-muted-foreground" />
                  <span className="text-sm capitalize">{profile.user.gender}</span>
                </div> */}
                <div className="flex items-center gap-2">
                  <UserCog size={20} className="text-muted-foreground" />
                  <span className="text-sm capitalize">{profile.user.user_type}</span>
                </div>

                {isCurrentUser && (
                  <ChangePasswordDialog />
                )}
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="hackathons" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>

                <TabsContent value="hackathons" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enrolled Hackathons</CardTitle>
                      <CardDescription>
                        Hackathons {isCurrentUser ? 'you are' : 'this user is'} currently participating in
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.enrolled_hackathons && profile.enrolled_hackathons.length > 0 ? (
                        <div className="space-y-4">
                          {profile.enrolled_hackathons.map((hackathon) => (
                            <Card key={hackathon.hackathon_id} className="overflow-hidden">
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium text-lg">{hackathon.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{hackathon.description}</p>
                                  </div>
                                  <Link to={`/hackathon/${hackathon.hackathon_id}`}>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {format(new Date(hackathon.start_date), 'MMM d')} - {format(new Date(hackathon.end_date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Max team size: {hackathon.max_team_size}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-4" />
                          <p>No hackathons enrolled yet</p>
                          <p className="text-sm mt-1">
                            {isCurrentUser ? 'Join a hackathon to see it listed here' : 'This user has not enrolled in any hackathons'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="teams" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Teams</CardTitle>
                      <CardDescription>
                        Teams {isCurrentUser ? 'you have' : 'this user has'} created or joined
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profile.teams && profile.teams.length > 0 ? (
                        <div className="space-y-6">
                          {profile.teams.map((team) => (
                            <Card key={team.team_id} className="overflow-hidden">
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-lg">{team.team_name}</h3>
                                      <Badge variant={team.project_status === 'Submitted' ? 'success' : 'secondary'}>
                                        {team.project_status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                                  </div>
                                  <Link to={`/teams/${team.team_id}`}>
                                    <Button variant="ghost" size="sm">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>

                                <div className="mt-4">
                                  <p className="text-sm font-medium">Hackathon: {team.Hackathon?.title}</p>
                                </div>

                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">Team Members:</p>
                                  <div className="space-y-2">
                                    {team.TeamMembers?.map((member) => (
                                      <div key={member.user_id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                              {member.User?.first_name?.[0]}{member.User?.last_name?.[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm">
                                            {member.User?.first_name} {member.User?.last_name}
                                            {team.team_leader_id === member.user_id && (
                                              <span className="ml-2 text-xs text-muted-foreground">(Leader)</span>
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          {member.verified ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Clock className="h-4 w-4 text-amber-500" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4" />
                          <p>No teams found</p>
                          <p className="text-sm mt-1">
                            {isCurrentUser ? 'Create or join a team to see it listed here' : 'This user has not created or joined any teams'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
