// Navbar.jsx
import { Code, Menu, X, LogOut, ChevronDown, User, Building2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate, NavLink } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { useSnackbar } from "notistack";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading, mutate } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  // // console.log(user)

  // Get user_type from localStorage
  const userType = localStorage.getItem("user_type");

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user_type");
      localStorage.removeItem("redirectAfterLogin");
      enqueueSnackbar("Logged out successfully", { variant: "success" });
      navigate("/");
      window.location.reload();
    }, 1000);
  };

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Hackathons", href: "/hackathons" },
    ...(user
      ? [
        {
          name: userType === "organizer" ? "Dashboard" : "My Hackathon",
          href:
            userType === "organizer"
              ? "/organizer/dashboard"
              : `/my-hackathons`,
        },
      ]
      : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">HackArch</span>
          </div>
        </Link>




        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `relative px-2 py-1 text-sm font-medium transition-colors 
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:rounded-full
                after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform
                ${isActive ? 'after:scale-x-100' : ''}
                `
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="flex gap-2 items-center ml-2">
            {!user ? (
              <>
                <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="rounded-full px-4">
                  Login
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="rounded-full px-4">Register</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl">Choose Account Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                      <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleNavigate("/register")}
                      >
                        <User className="h-4 w-4" />
                        Register as User
                      </Button>
                      <Button
                        className="w-full flex items-center justify-center gap-2"
                        variant="secondary"
                        onClick={() => handleNavigate("/org/register")}
                      >
                        <Building2 className="h-4 w-4" />
                        Register as Organizer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <DropdownMenu className={""}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-medium">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || ''}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(`/profile/${user.data.user_id}`)}
                    className="text-black focus:text-muted-foreground cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin"></div>
                        Logging out...
                      </div>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 p-2"
          > */}
          {isOpen ? <X onClick={() => setIsOpen(!isOpen)} size={30} /> : <Menu onClick={() => setIsOpen(!isOpen)} size={30} />}
          {/* </Button> */}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 px-4 py-2 space-y-3 border-t border-gray-100 animate-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="flex flex-col gap-2 pt-2 pb-1">
            {!user ? (
              <>
                <Button
                  onClick={() => handleNavigate("/login")}
                  variant="outline"
                  className="w-full justify-center"
                >
                  Login
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-full justify-center">Register</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-center">Choose Account Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-2">
                      <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleNavigate("/register")}
                      >
                        <User className="h-4 w-4" />
                        Register as User
                      </Button>
                      <Button
                        className="w-full flex items-center justify-center gap-2"
                        variant="secondary"
                        onClick={() => handleNavigate("/org/register")}
                      >
                        <Building2 className="h-4 w-4" />
                        Register as Organizer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="space-y-3">
                <div className="px-1">
                  {/* Top row: Avatar and username */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || ''}</p>
                    </div>
                  </div>

                  {/* Bottom row: Profile link */}
                  <div className="mt-3 flex flex-row cursor-pointer">
                    <Link
                      to={`/profile/${user.data.user_id}`}
                      className="text-black focus:text-muted-foreground cursor-pointer"
                    >
                      {/* <User className="w-4 h-4 mr-2 flex-shrink-0" /> */}
                      <p className="inline-block bg-blue-100 text-sm text-blue-600 hover:underline rounded-md px-2 py-1">
                        Profile
                      </p>
                    </Link>
                  </div>

                </div>


                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full justify-center"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      Logging out...
                    </div>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
