import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchTeams = createAsyncThunk(
  "teams/fetchTeams",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/teams");
      return res.data.teams || [];
    } catch (err) {
      console.error("fetchTeams error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teams");
    }
  }
);

export const showTeam = createAsyncThunk(
  "teams/showTeam",
  async (teamId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/teams/${teamId}`);
      const teamData = res.data.team || {};
      return {
        team: {
          ...teamData,
          lead: teamData.lead || null,
          members: teamData.members || res.data.members || [],
        }
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load team");
    }
  }
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/teams", data);
      return res.data.team;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create team");
    }
  }
);

export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/teams/${id}`, {
        _method: "PUT",
        ...data,
      });
      return res.data.team;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update team");
    }
  }
);

export const deleteTeam = createAsyncThunk(
  "teams/deleteTeam",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/teams/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete team");
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  "teams/fetchTeamMembers",
  async (teamId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/teams/${teamId}/members`);
      return { teamId, members: res.data.members || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch members");
    }
  }
);

export const updateTeamMembers = createAsyncThunk(
  "teams/updateTeamMembers",
  async ({ teamId, members }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/teams/${teamId}/members`, {
        _method: "PUT",
        members,
      });
      return { teamId, members: res.data.members || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update members");
    }
  }
);

// ✅ FIXED: fetchAgents - NO loading state interference
export const fetchAgents = createAsyncThunk(
  "teams/fetchAgents",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/agents?company_id=${companyId}`);
      return res.data.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch agents");
    }
  }
);

const teamsSlice = createSlice({
  name: "teams",
  initialState: {
    teams: [],
    teamDetails: null,
    membersCache: {},
    agentsCache: {},  // ✅ agents cache
    loading: false,   // ✅ only for main operations (teams, showTeam)
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTeams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // showTeam
      .addCase(showTeam.pending, (state) => {
        state.loading = true;
        state.teamDetails = null;
        state.error = null;
      })
      .addCase(showTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teamDetails = action.payload;
      })
      .addCase(showTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTeam
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      // updateTeam
      .addCase(updateTeam.fulfilled, (state, action) => {
        const idx = state.teams.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.teams[idx] = action.payload;
      })
      // deleteTeam
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter((t) => t.id !== action.payload);
      })
      // fetchTeamMembers
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.membersCache[action.payload.teamId] = action.payload.members;
      })
      // updateTeamMembers
      .addCase(updateTeamMembers.fulfilled, (state, action) => {
        state.membersCache[action.payload.teamId] = action.payload.members;
      })
      // ✅ FIXED: fetchAgents - NO loading state change
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agentsCache[action.meta.arg] = action.payload;
      });
      // No .pending/.rejected for fetchAgents to avoid loading spinner
  },
});

export default teamsSlice.reducer;