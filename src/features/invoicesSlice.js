import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchInvoices = createAsyncThunk(
    "invoices/fetchInvoices",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/invoices");
            return res.data.data || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const showInvoice = createAsyncThunk(
    "invoices/showInvoice",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/invoices/${id}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const createInvoice = createAsyncThunk(
    "invoices/createInvoice",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/invoices", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const updateInvoice = createAsyncThunk(
    "invoices/updateInvoice",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            formData.append("_method", "PUT");
            const res = await axiosInstance.post(`/invoices/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const deleteInvoice = createAsyncThunk(
    "invoices/deleteInvoice",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/invoices/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

export const fetchProjects = createAsyncThunk(
    "invoices/fetchProjects",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/projects");
            return res.data.projects || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed");
        }
    }
);

const invoicesSlice = createSlice({
    name: "invoices",
    initialState: {
        invoices: [],
        invoiceDetails: null,
        projects: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearInvoiceDetails: (state) => {
            state.invoiceDetails = null;
        },
    },
    extraReducers: (b) => {
        b
            // fetchInvoices
            .addCase(fetchInvoices.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchInvoices.fulfilled, (s, a) => { s.loading = false; s.invoices = a.payload; })
            .addCase(fetchInvoices.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            // showInvoice
            .addCase(showInvoice.pending, (s) => { s.loading = true; })
            .addCase(showInvoice.fulfilled, (s, a) => { s.loading = false; s.invoiceDetails = a.payload; })
            .addCase(showInvoice.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            // create
            .addCase(createInvoice.fulfilled, (s, a) => {
                s.invoices.push(a.payload);
            })

            // update
            .addCase(updateInvoice.fulfilled, (s, a) => {
                const i = s.invoices.findIndex(c => c.id === a.payload.id);
                if (i > -1) s.invoices[i] = a.payload;
                if (s.invoiceDetails?.id === a.payload.id) s.invoiceDetails = a.payload;
            })

            // delete
            .addCase(deleteInvoice.fulfilled, (s, a) => {
                s.invoices = s.invoices.filter(c => c.id !== a.payload);
                if (s.invoiceDetails?.id === a.payload) s.invoiceDetails = null;
            })

            // fetchProjects
            .addCase(fetchProjects.fulfilled, (s, a) => { s.projects = a.payload; });
    },
});

export const { clearInvoiceDetails } = invoicesSlice.actions;
export default invoicesSlice.reducer;