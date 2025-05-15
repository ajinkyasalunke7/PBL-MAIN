import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_REQUEST_SECRET || "eyJhbGciOiJIUzI1NiJ9.eyJJc3N1ZXIiOiJGUk9OVEVORCIsIm1lc3NhZ2UiOiLgpJrgpLIg4KSo4KS_4KSYIOCksuCkteCkoeCljeCkr-CkviIsImlhdCI6MTc0NTY2MTIyNX0.lS_2Wt2IoUetEV05FoVgGBArduashTCHnYiacu5qFyQ"
  },
});

// Auth token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Response handler
const handleResponse = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Request failed");
  }
  return response.data;
};

// Error handler
const handleError = (error) => {
  console.error("API Error:", error);
  throw new Error(
    error.response?.data?.message || error.message || "Request failed"
  );
};

// User Routes
export const register = async (data) => {
  try {
    const response = await api.post("/user/register", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const login = async (data) => {
  try {
    const response = await api.post("/user/login", data);
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const getAllHackathons = async () => {
  try {
    const response = await api.get("/user/hackathons/all");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const enrollInHackathon = async (data) => {
  try {
    const response = await api.post("/user/enroll", data);
    // // console.log(response);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateTeamMembers = async (teamId, data) => {
  try {
    const response = await api.put(`/user/teams/${teamId}/members`, data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getTeamMembers = async (teamId) => {
  try {
    const response = await api.get(`/user/teams/${teamId}/members`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const resendInvitation = async (teamId, memberId) => {
  try {
    // // console.log(teamId, memberId);
    const response = await api.post(
      `/user/teams/${teamId}/members/${memberId}/resend`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const acceptInvitation = async (token) => {
  try {
    const response = await api.get(`/user/invitation/accept/${token}`);
    // // console.log(JSON.stringify(response));
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/user/profile", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserProfileById = async (userId) => {
  try {
    const response = await api.get(`/user/profile/${userId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getTeamDetails = async (teamId) => {
  try {
    const response = await api.get(`/user/teams/${teamId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonById = async (id) => {
  try {
    const response = await api.get(`/user/hackathons/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const submitProject = async (data) => {
  try {
    const response = await api.post("/user/projects", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const changePassword = async (data) => {
  try {
    const response = await api.put("/user/change-password", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserDashboard = async () => {
  try {
    const response = await api.get("/user/dashboard");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserTeams = async () => {
  try {
    const response = await api.get("/user/teams");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserProjects = async () => {
  try {
    const response = await api.get("/user/projects");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Organizer Routes
export const createHackathon = async (data) => {
  try {
    const response = await api.post("/organizer/hackathons", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getOrganizerHackathonById = async (id) => {
  try {
    const response = await api.get(`/organizer/hackathons/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonTeams = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/teams`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonPrizes = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/prizes`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonStats = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/stats`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonParticipants = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/participants`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getTeamProject = async (teamId) => {
  try {
    const response = await api.get(`/organizer/teams/${teamId}/project`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getOrganizerHackathons = async () => {
  try {
    const response = await api.get("/organizer/hackathons");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonProjects = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/projects`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const addPrize = async (hackathonId, data) => {
  try {
    const response = await api.post(
      `/organizer/hackathons/${hackathonId}/prizes`,
      data
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getAllJudges = async () => {
  try {
    const response = await api.get("/organizer/judges");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Add a new judge to the database
export const createJudge = async (data) => {
  try {
    const response = await api.post("/organizer/judges", data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getHackathonJudges = async (hackathonId) => {
  try {
    const response = await api.get(
      `/organizer/hackathons/${hackathonId}/judges`
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const assignJudge = async (hackathonId, teamId, judgeId) => {
  try {
    const response = await api.post(
      `/organizer/hackathons/${hackathonId}/teams/${teamId}/judges`,
      { judge_id: judgeId }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};


export const addTopicsToHackathon = async (hackathonId, topics) => {
  try {
    const response = await api.post(
      `/organizer/hackathons/${hackathonId}/topics`,
      { hackathon_id: hackathonId, topics }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const declareWinner = async (hackathonId, prizeId, teamId) => {
  try {
    const response = await api.post(
      `/organizer/hackathons/${hackathonId}/winners`,
      {
        hackathon_id: hackathonId,
        prize_id: prizeId,
        team_id: teamId
      }
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Get topics for a specific hackathon
export const getHackathonTopics = async (hackathonId) => {
  try {
    const response = await fetch(
      `${API_URL}/hackathons/${hackathonId}/topics`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch hackathon topics");
  }
};

export const getEnrolledHackathons = async () => {
  try {
    // // console.log("getting")
    const response = await api.get("/user/enrolled-hackathons");
    // console.log(response);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Utils Routes
export const searchColleges = async (keyword) => {
  try {
    const response = await api.post("/utils/search", { keyword });

    // The response is a direct array, not {success: true, data: [...]}
    if (Array.isArray(response.data)) {
      // Transform the array into a format the component expects
      return response.data.map((college) => ({
        id: college[0],
        university: college[1],
        name: college[2],
        type: college[3],
        state: college[4],
        city: college[5],
      }));
    }

    // Fallback to standard response handling
    return handleResponse(response);
  } catch (error) {
    console.error("Error searching colleges:", error);
    return []; // Return empty array on error instead of throwing
  }
};

export const getCollegesByState = async (state, offset = 0) => {
  try {
    const response = await api.post("/utils/state", { state, offset });

    // The response is a direct array, not {success: true, data: [...]}
    if (Array.isArray(response.data)) {
      return response.data.map((college) => ({
        id: college[0],
        university: college[1],
        name: college[2],
        type: college[3],
        state: college[4],
        city: college[5],
      }));
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Error getting colleges by state:", error);
    return [];
  }
};

export const getCollegesByDistrict = async (district, offset = 0) => {
  try {
    const response = await api.post("/utils/district", { district, offset });

    // The response is a direct array, not {success: true, data: [...]}
    if (Array.isArray(response.data)) {
      return response.data.map((college) => ({
        id: college[0],
        university: college[1],
        name: college[2],
        type: college[3],
        state: college[4],
        city: college[5],
      }));
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Error getting colleges by district:", error);
    return [];
  }
};

export const getAllStates = async () => {
  try {
    const response = await api.post("/utils/allstates");

    // The response is a direct array, not {success: true, data: [...]}
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Error getting all states:", error);
    return [];
  }
};

export const getDistrictsByState = async (state) => {
  try {
    const response = await api.post("/utils/districts", { state });

    // The response is a direct array, not {success: true, data: [...]}
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return handleResponse(response);
  } catch (error) {
    console.error("Error getting districts by state:", error);
    return [];
  }
};

// Remove duplicate functions
// export const fetchTeams = getHackathonTeams;
// export const fetchPrizes = getHackathonPrizes;
// export const getDetailedHackathon = getOrganizerHackathonById;

// Judge API functions
export const getJudgeProfile = async () => {
  try {
    const response = await api.get('/judge/profile');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getJudgeAssignments = async () => {
  try {
    const response = await api.get('/judge/assignments');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateAssignmentStatus = async (assignmentId, status) => {
  try {
    const response = await api.put(`/judge/assignments/${assignmentId}/status`, { status });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getTeamDetailsForJudge = async (teamId) => {
  try {
    const response = await api.get(`/judge/teams/${teamId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const submitProjectScore = async (projectId, scoreData) => {
  try {
    const response = await api.post(`/judge/projects/${projectId}/score`, scoreData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getProjectScore = async (projectId) => {
  try {
    const response = await api.get(`/judge/projects/${projectId}/score`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateProjectScore = async (projectId, scoreData) => {
  try {
    const response = await api.put(`/judge/projects/${projectId}/score`, scoreData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateHackathon = async (hackathonId, data) => {
  try {
    const response = await api.put(
      `/organizer/hackathons/${hackathonId}`,
      data
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};
