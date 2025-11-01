import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchContracts = createAsyncThunk(
    "contracts/fetchContracts",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/contracts");
            return res.data.data || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const showContract = createAsyncThunk(
    "contracts/showContract",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/contracts/${id}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const createContract = createAsyncThunk(
    "contracts/createContract",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/contracts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const updateContract = createAsyncThunk(
    "contracts/updateContract",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            formData.append("_method", "PUT");
            const res = await axiosInstance.post(`/contracts/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const deleteContract = createAsyncThunk(
    "contracts/deleteContract",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/contracts/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const fetchProjects = createAsyncThunk(
    "contracts/fetchProjects",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/projects");
            return res.data.projects || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

const contractsSlice = createSlice({
    name: "contracts",
    initialState: {
        contracts: [],
        contractDetails: null,
        projects: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearContractDetails: (state) => {
            state.contractDetails = null;
        },
    },
    extraReducers: (b) => {
        b
            // fetchContracts
            .addCase(fetchContracts.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchContracts.fulfilled, (s, a) => { s.loading = false; s.contracts = a.payload; })
            .addCase(fetchContracts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            // showContract
            .addCase(showContract.pending, (s) => { s.loading = true; })
            .addCase(showContract.fulfilled, (s, a) => { s.loading = false; s.contractDetails = a.payload; })
            .addCase(showContract.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            // create
            .addCase(createContract.fulfilled, (s, a) => {
                s.contracts.push(a.payload);
            })

            // update
            .addCase(updateContract.fulfilled, (s, a) => {
                const i = s.contracts.findIndex(c => c.id === a.payload.id);
                if (i > -1) s.contracts[i] = a.payload;
                if (s.contractDetails?.id === a.payload.id) s.contractDetails = a.payload;
            })

            // delete
            .addCase(deleteContract.fulfilled, (s, a) => {
                s.contracts = s.contracts.filter(c => c.id !== a.payload);
                if (s.contractDetails?.id === a.payload) s.contractDetails = null;
            })

            // fetchProjects
            .addCase(fetchProjects.fulfilled, (s, a) => { s.projects = a.payload; });
    },
});

export const { clearContractDetails } = contractsSlice.actions;
export default contractsSlice.reducer;