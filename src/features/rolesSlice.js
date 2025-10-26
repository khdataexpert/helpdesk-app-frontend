import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchRoles = createAsyncThunk("roles/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/roles");
    const data = res.data.roles;
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch roles");
  }
});

export const createRole = createAsyncThunk("roles/createRole", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/roles", data);
    return res.data.role || res.data.data || res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create role");
  }
});

export const updateRole = createAsyncThunk("roles/updateRole", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/roles/${id}`, data);
    return res.data.role || res.data.data || res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update role");
  }
});

export const deleteRole = createAsyncThunk("roles/deleteRole", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/roles/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete role");
  }
});

const rolesSlice = createSlice({
  name: "roles",
  initialState: { roles: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) =>
      { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => 
      { state.roles.push(action.payload);
       })
      .addCase(updateRole.fulfilled, (state, action) => {
        const i = state.roles.findIndex(r => r.id === action.payload.id);
        if (i !== -1) state.roles[i] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter(r => r.id !== action.payload);
      });
  },
});

export default rolesSlice.reducer;