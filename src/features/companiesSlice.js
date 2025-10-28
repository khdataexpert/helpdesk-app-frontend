import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchCompanies = createAsyncThunk("companies/fetchCompanies", async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/companies");
      const companies = response.data.companies;
      if (!companies) {
        throw new Error("Invalid response format: No companies data found");
      }
      return companies;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch companies"
      );
    }
  }
);

export const createCompany = createAsyncThunk("companies/createCompany", async (data, { rejectWithValue }) => {
    try {
      // Validate required fields
      const requiredFields = ["name", "email"];
      for (const field of requiredFields) {
        if (!data[field] || !data[field].trim()) {
          throw new Error(`The ${field} field is required.`);
        }
      }
      // Validate image file extension
     if (data.image instanceof File) {
  const validExtensions = [".png", ".jpg", ".jpeg"];
  const fileExtension = data.image.name
    .slice(data.image.name.lastIndexOf("."))
    .toLowerCase();
  if (!validExtensions.includes(fileExtension)) {
    throw new Error("Only PNG, JPG, and JPEG files are allowed.");
  }
}
     const formData = new FormData();
       Object.keys(data).forEach((key) => {
    if (data[key]) {
        formData.append(key, data[key]);
    }
});
      const res = await axiosInstance.post("/companies", formData, {
       headers: { "Content-Type": "multipart/form-data" },
       });
      const company = res.data.company || res.data.data;
      if (!company) {
        throw new Error("Invalid response format: No company data found");
      }
      return company;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create company"
      );
    }
  }
);

export const updateCompany = createAsyncThunk("companies/updateCompany", async ({ id, data }, { rejectWithValue }) => {
    try {
      const requiredFields = ["name", "email"];
      for (const field of requiredFields) {
        if (!data[field] || !data[field].trim()) {
          throw new Error(`The ${field} field is required.`);
        }
      }

      if (data.image) {
        const validExtensions = [".png", ".jpg", ".jpeg"];
        const fileExtension = data.image.name
          .slice(data.image.name.lastIndexOf("."))
          .toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
          throw new Error("Only PNG, JPG, and JPEG files are allowed.");
        }
      }

      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      const res = await axiosInstance.post(`/companies/${id}`, formData, {
       headers: { "Content-Type": "multipart/form-data" },
       });

      const company = res.data.company || res.data.data;
      if (!company) {
        throw new Error("Invalid response format: No company data found");
      }
      return company;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update company"
      );
    }
  }
);

export const deleteCompany = createAsyncThunk("companies/deleteCompany", async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/companies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete company"
      );
    }
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Failed to fetch companies";
      })
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Failed to create company";
      })
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Failed to update company";
      })
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "Failed to delete company";
      });
  },
});

export default companiesSlice.reducer;