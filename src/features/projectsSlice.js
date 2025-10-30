import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// GET all projects
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/projects");
      return res.data.projects || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

// GET single project
export const showProject = createAsyncThunk(
  "projects/showProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${projectId}`);
      return res.data.project;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load project");
    }
  }
);

// CREATE project
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/projects", data);
      return res.data.project;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
    }
  }
);

// UPDATE project
export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/projects/${id}`, {
        _method: "PUT",
        ...data,
      });
      return res.data.project;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update project");
    }
  }
);

// DELETE project
export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete project");
    }
  }
);

// ASSIGN project to agent
export const assignProject = createAsyncThunk(
  "projects/assignProject",
  async ({ projectId, agentId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/projects/${projectId}/assign`, {
        assigned_to: agentId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to assign project");
    }
  }
);

// FETCH agents for assignment
export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/agents", {
        company_id: companyId,
      });
      return { companyId, agents: res.data.data || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch agents");
    }
  }
);

export const fetchTeams = createAsyncThunk(
  "projects/fetchTeams",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/teams?company_id=${companyId}`);
      return { companyId, teams: res.data.teams || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teams");
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
    projectDetails: null,
    agentsCache: {},
    teamsCache: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearProjectDetails: (state) => {
      state.projectDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // showProject
      .addCase(showProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(showProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projectDetails = action.payload;
      })
      .addCase(showProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      // update
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.projects[idx] = action.payload;
        if (state.projectDetails?.id === action.payload.id) {
          state.projectDetails = action.payload;
        }
      })
      // delete
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      // assign
      .addCase(assignProject.fulfilled, (state, action) => {
        const { project } = action.payload;
        const idx = state.projects.findIndex((p) => p.id === project.id);
        if (idx !== -1) state.projects[idx] = project;
        if (state.projectDetails?.id === project.id) {
          state.projectDetails = project;
        }
      })
      // agents
     .addCase(fetchAgents.fulfilled, (state, action) => {
      state.agentsCache[action.payload.companyId] = action.payload.agents;
     })
     //teams
     .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teamsCache[action.payload.companyId] = action.payload.teams;
      });
  },
});

export const { clearProjectDetails } = projectsSlice.actions;
export default projectsSlice.reducer;