import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/permissions");
      return res.data.permissions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch permissions");
    }
  }
);

const permissionsSlice = createSlice({
  name: "permissions",
  initialState: { 
    list: [], 
    loading: false, 
    error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => { state.loading = true; })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default permissionsSlice.reducer;
