import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance"; 

export const fetchUsers = createAsyncThunk("users/fetchUsers",async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("users"); 
    return response.data.data; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const createUser = createAsyncThunk("users/createUser", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/users", data);
    return res.data.user || res.data.data || res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to create user");
  }
});

export const updateUser = createAsyncThunk("users/updateUser", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data.user || res.data.data || res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update user");
  }
});

export const deleteUser = createAsyncThunk("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete user");
  }
});

export const updateUserPermissions = createAsyncThunk("users/updateUserPermissions", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/users/${id}/permissions`, data);
    return res.data.user || res.data.data || res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to update user permissions");
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
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Failed to fetch users";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default usersSlice.reducer;