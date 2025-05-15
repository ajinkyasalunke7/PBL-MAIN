import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { getOrganizerHackathonById, updateHackathon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function EditHackathon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    max_team_size: 4,
    registration_start_date: "",
    registration_end_date: "",
  });
  const [dateErrors, setDateErrors] = useState({});

  useEffect(() => {
    fetchHackathonDetails();
  }, [id]);

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrganizerHackathonById(id);
      if (response.success) {
        const hackathon = response.data;
        setFormData({
          title: hackathon.title,
          description: hackathon.description,
          start_date: hackathon.start_date.split("T")[0],
          end_date: hackathon.end_date.split("T")[0],
          max_team_size: hackathon.max_team_size,
          registration_start_date:
            hackathon.registration_start_date.split("T")[0],
          registration_end_date: hackathon.registration_end_date.split("T")[0],
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch hackathon details"
        );
      }
    } catch (error) {
      console.error("Error fetching hackathon details:", error);
      enqueueSnackbar(error.message || "Failed to fetch hackathon details", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDates = (name, value) => {
    const errors = {};
    const date = new Date(value);
    const {
      registration_start_date,
      registration_end_date,
      start_date,
      end_date,
    } = formData;

    const regStart =
      name === "registration_start_date"
        ? date
        : new Date(registration_start_date);
    const regEnd =
      name === "registration_end_date" ? date : new Date(registration_end_date);
    const eventStart = name === "start_date" ? date : new Date(start_date);
    const eventEnd = name === "end_date" ? date : new Date(end_date);

    if (name === "registration_end_date" && registration_start_date) {
      if (regEnd <= regStart) {
        errors.registration_end_date =
          "Registration end must be after start date";
        return errors;
      }
    }

    if (name === "start_date" && registration_end_date) {
      if (eventStart <= regEnd) {
        errors.start_date = "Event start must be after registration end";
        return errors;
      }
    }

    if (name === "end_date" && start_date) {
      if (eventEnd <= eventStart) {
        errors.end_date = "Event end must be after start date";
        return errors;
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name.includes("date")) {
      const errors = validateDates(name, value);
      setDateErrors((prev) => ({ ...prev, ...errors }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(dateErrors).length > 0) {
      enqueueSnackbar("Please fix the date errors before submitting", {
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await updateHackathon(id, formData);
      enqueueSnackbar("Hackathon updated successfully!", {
        variant: "success",
      });
      navigate(`/hackathon/${id}`);
    } catch (error) {
      console.error("Error updating hackathon:", error);
      enqueueSnackbar("Failed to update hackathon. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-[-75px] flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Edit Hackathon</h1>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Hackathon Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Hackathon Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="registration_start_date">
              Registration Start Date
            </Label>
            <Input
              type="date"
              id="registration_start_date"
              name="registration_start_date"
              value={formData.registration_start_date}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
            {dateErrors.registration_start_date && (
              <p className="text-red-500 text-sm mt-1">
                {dateErrors.registration_start_date}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="registration_end_date">Registration End Date</Label>
            <Input
              type="date"
              id="registration_end_date"
              name="registration_end_date"
              value={formData.registration_end_date}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
            {dateErrors.registration_end_date && (
              <p className="text-red-500 text-sm mt-1">
                {dateErrors.registration_end_date}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="start_date">Event Start Date</Label>
            <Input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
            {dateErrors.start_date && (
              <p className="text-red-500 text-sm mt-1">
                {dateErrors.start_date}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="end_date">Event End Date</Label>
            <Input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
            {dateErrors.end_date && (
              <p className="text-red-500 text-sm mt-1">{dateErrors.end_date}</p>
            )}
          </div>

          <div>
            <Label htmlFor="max_team_size">Maximum Team Size</Label>
            <Input
              type="number"
              id="max_team_size"
              name="max_team_size"
              value={formData.max_team_size}
              onChange={handleInputChange}
              min="1"
              required
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || Object.keys(dateErrors).length > 0}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Update Hackathon"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
