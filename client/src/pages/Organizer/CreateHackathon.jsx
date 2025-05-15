import { useState } from "react";
import { createHackathon } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CreateHackathon() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "hackathon",
    start_date: "",
    end_date: "",
    max_team_size: 4,
    registration_start_date: "",
    registration_end_date: "",
  });
  const [dateErrors, setDateErrors] = useState({});

  const validateDates = (name, value) => {
    const errors = {};
    const date = new Date(value);
    const {
      registration_start_date,
      registration_end_date,
      start_date,
      end_date,
    } = formData;

    // Create date objects for comparison
    const regStart =
      name === "registration_start_date"
        ? date
        : new Date(registration_start_date);
    const regEnd =
      name === "registration_end_date" ? date : new Date(registration_end_date);
    const eventStart = name === "start_date" ? date : new Date(start_date);
    const eventEnd = name === "end_date" ? date : new Date(end_date);

    // 1. First check registration dates if registration end is being set
    if (name === "registration_end_date" && registration_start_date) {
      if (regEnd <= regStart) {
        errors.registration_end_date =
          "Registration end must be after start date";
        return errors;
      }
    }

    // 2. Then check event dates if event end is being set
    if (name === "end_date" && start_date) {
      if (eventEnd <= eventStart) {
        errors.end_date = "Event end must be after start date";
        return errors;
      }
    }

    // 3. Now check relationships between registration and event dates
    if (registration_end_date && start_date) {
      if (regEnd >= eventStart) {
        errors.registration_end_date =
          "Registration must end before event starts";
        errors.start_date = "Event must start after registration ends";
      }
    }

    // 4. Check if registration start is before event end
    if (registration_start_date && end_date) {
      if (regStart >= eventEnd) {
        errors.registration_start_date =
          "Registration must start before event ends";
        errors.end_date = "Event must end after registration starts";
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate dates on change
    if (name.includes("date")) {
      const errors = validateDates(name, value);
      setDateErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any date errors
    if (Object.keys(dateErrors).length > 0) {
      enqueueSnackbar("Please fix the date validation errors", {
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const apiData = {
        ...formData,
      };

      await createHackathon(apiData);
      enqueueSnackbar("Hackathon created successfully!", {
        variant: "success",
      });
      navigate("/organizer/dashboard");
      setFormData({
        title: "",
        description: "hackathon description",
        start_date: "",
        end_date: "",
        max_team_size: 4,
        registration_start_date: "",
        registration_end_date: "",
      });
      setDateErrors({});
    } catch (error) {
      console.error("Error creating hackathon:", error);
      enqueueSnackbar("Failed to create hackathon. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted px-2 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Create a New Hackathon</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="block mb-1 text-base font-medium text-gray-700">Hackathon Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter hackathon title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div>
            <Label htmlFor="description" className="block mb-1 text-base font-medium text-gray-700">Hackathon Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the hackathon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration_start_date" className="block mb-1 text-base font-medium text-gray-700">Registration Start Date</Label>
              <Input
                type="date"
                id="registration_start_date"
                name="registration_start_date"
                value={formData.registration_start_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${dateErrors.registration_start_date ? "border-red-500" : "border-gray-300"}`}
              />
              {dateErrors.registration_start_date && (
                <p className="text-red-500 text-xs mt-1">{dateErrors.registration_start_date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="registration_end_date" className="block mb-1 text-base font-medium text-gray-700">Registration End Date</Label>
              <Input
                type="date"
                id="registration_end_date"
                name="registration_end_date"
                value={formData.registration_end_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${dateErrors.registration_end_date ? "border-red-500" : "border-gray-300"}`}
              />
              {dateErrors.registration_end_date && (
                <p className="text-red-500 text-xs mt-1">{dateErrors.registration_end_date}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="block mb-1 text-base font-medium text-gray-700">Event Start Date</Label>
              <Input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${dateErrors.start_date ? "border-red-500" : "border-gray-300"}`}
              />
              {dateErrors.start_date && (
                <p className="text-red-500 text-xs mt-1">{dateErrors.start_date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="end_date" className="block mb-1 text-base font-medium text-gray-700">Event End Date</Label>
              <Input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${dateErrors.end_date ? "border-red-500" : "border-gray-300"}`}
              />
              {dateErrors.end_date && (
                <p className="text-red-500 text-xs mt-1">{dateErrors.end_date}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="max_team_size" className="block mb-1 text-base font-medium text-gray-700">Max Team Size</Label>
            <Input
              type="number"
              id="max_team_size"
              name="max_team_size"
              value={formData.max_team_size}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <span className="text-xs text-gray-500">Set the maximum number of members allowed in a team.</span>
          </div>
          <Button
            type="submit"
            className="w-full py-2 text-lg font-semibold rounded-lg shadow-sm bg-primary hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Creating...
              </span>
            ) : (
              "Create Hackathon"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
