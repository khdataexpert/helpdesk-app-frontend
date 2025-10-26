import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

const storedUser = sessionStorage.getItem("user")
  ? JSON.parse(sessionStorage.getItem("user"))
  : null;

if (storedUser?.company?.style) {
  const { primaryColor, secondaryColor, backgroundColor, textColor } = storedUser.company.style;
  const root = document.documentElement;
  if (primaryColor) root.style.setProperty("--primary-color", primaryColor);
  if (secondaryColor) root.style.setProperty("--secondary-color", secondaryColor);
  if (backgroundColor) root.style.setProperty("--background-color", backgroundColor);
  if (textColor) root.style.setProperty("--text-color", textColor);
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", { email, password });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await axiosInstance.post("/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    sessionStorage.clear();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: sessionStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        
        // Persist session data
        sessionStorage.setItem("token", action.payload.token);
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));

        // Apply dynamic theme colors
        const user = action.payload.user;
        if (user.company && user.company.style) {
          const { primaryColor, secondaryColor, backgroundColor, textColor } = user.company.style;
          const root = document.documentElement;
          if (primaryColor) root.style.setProperty("--primary-color", primaryColor);
          if (secondaryColor) root.style.setProperty("--secondary-color", secondaryColor);
          if (backgroundColor) root.style.setProperty("--background-color", backgroundColor);
          if (textColor) root.style.setProperty("--text-color", textColor);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;
