import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { assignJudge, getAllJudges, createJudge } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AddJudge() {
  const { id } = useParams();
  const [judgeId, setJudgeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState([]);
  const [judgesLoading, setJudgesLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for adding a judge
  const [newJudge, setNewJudge] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [addJudgeLoading, setAddJudgeLoading] = useState(false);
  const [addJudgeError, setAddJudgeError] = useState(null);
  const [addJudgeSuccess, setAddJudgeSuccess] = useState(null);

  const fetchJudges = async () => {
    setJudgesLoading(true);
    try {
      const response = await getAllJudges();
      if (response.success) {
        setJudges(response.data || []);
      } else {
        setError("Failed to load judges: " + response.message);
      }
    } catch (err) {
      console.error("Failed to fetch judges", err);
      setError("Failed to load judges. Please try again.");
    } finally {
      setJudgesLoading(false);
    }
  };

  useEffect(() => {
    // fetchJudges();
  }, []);

  const handleAssignJudge = async () => {
    try {
      setLoading(true);
      await assignJudge(id, judgeId); // Pass judgeId directly
      alert("Judge assigned successfully!");
    } catch (err) {
      console.error("Failed to assign judge", err);
      setError("Failed to assign judge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle add judge to database
  const handleAddJudge = async (e) => {
    e.preventDefault();
    setAddJudgeLoading(true);
    setAddJudgeError(null);
    setAddJudgeSuccess(null);
    try {
      // Only send first_name, last_name, email
      const response = await createJudge({
        first_name: newJudge.first_name,
        last_name: newJudge.last_name,
        email: newJudge.email
      });
      if (response.success) {
        setAddJudgeSuccess("Judge added successfully!");
        setNewJudge({ first_name: "", last_name: "", email: "", password: "" });
        fetchJudges();
      } else {
        setAddJudgeError(response.message || "Failed to add judge");
      }
    } catch (err) {
      setAddJudgeError(err.message || "Failed to add judge");
    } finally {
      setAddJudgeLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-muted">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">Add Judge</h1>
        <form onSubmit={handleAddJudge} className="space-y-6">
          <div>
            <Label htmlFor="judgeFirstName" className="block mb-1 text-base font-medium text-gray-700">First Name</Label>
            <input
              id="judgeFirstName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              type="text"
              value={newJudge.first_name}
              onChange={e => setNewJudge({ ...newJudge, first_name: e.target.value })}
              required
              placeholder="Enter first name"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="judgeLastName" className="block mb-1 text-base font-medium text-gray-700">Last Name</Label>
            <input
              id="judgeLastName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              type="text"
              value={newJudge.last_name}
              onChange={e => setNewJudge({ ...newJudge, last_name: e.target.value })}
              required
              placeholder="Enter last name"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="judgeEmail" className="block mb-1 text-base font-medium text-gray-700">Email</Label>
            <input
              id="judgeEmail"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              type="email"
              value={newJudge.email}
              onChange={e => setNewJudge({ ...newJudge, email: e.target.value })}
              required
              placeholder="Enter judge's email"
              autoComplete="off"
            />
            <p className="mt-3 text-xs text-gray-500">Default password will be: <span className="font-semibold text-primary">123456</span></p>
          </div>
          <Button
            type="submit"
            disabled={addJudgeLoading}
            className="w-full py-2 text-lg font-semibold rounded-lg shadow-sm bg-primary hover:bg-primary/90 transition"
          >
            {addJudgeLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Adding...
              </span>
            ) : "Add Judge"}
          </Button>
          {addJudgeError && <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mt-2 text-center">{addJudgeError}</div>}
          {addJudgeSuccess && <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mt-2 text-center">{addJudgeSuccess}</div>}
        </form>
      </div>
    </div>
  );
}
