import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance"; 

export const fetchUsers = createAsyncThunk("users/fetchUsers", 
  async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("users"); 
    return response.data.data; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
  state.loading = false;
  // handle either message string or full response
  state.error =
    typeof action.payload === "string"
      ? action.payload
      : action.payload?.message || "Failed to fetch users";
});

  },
});

export default usersSlice.reducer;
