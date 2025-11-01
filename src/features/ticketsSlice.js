import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchAgents = createAsyncThunk(
    "tickets/fetchAgents",
    async (projectId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/projects/${projectId}`);
            const project = res.data.project || res.data;
            const agents = project.assigned_to ? [project.assigned_to] : [];
            return { projectId, agents };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch agent");
        }
    }
);

export const fetchTickets = createAsyncThunk(
    "tickets/fetchTickets",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/tickets");
            return res.data.tickets || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch tickets");
        }
    }
);

export const showTicket = createAsyncThunk(
    "tickets/showTicket",
    async (ticketId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/tickets/${ticketId}`);
            return res.data.ticket;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to load ticket");
        }
    }
);

export const createTicket = createAsyncThunk(
    "tickets/createTicket",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/tickets", data);
            return res.data.ticket;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to create ticket");
        }
    }
);

export const updateTicket = createAsyncThunk(
    "tickets/updateTicket",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/tickets/${id}`, {
                _method: "PUT",
                ...data,
            });
            return res.data.ticket;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to update ticket");
        }
    }
);

export const deleteTicket = createAsyncThunk(
    "tickets/deleteTicket",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/tickets/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete ticket");
        }
    }
);

export const assignTicketToMe = createAsyncThunk(
    "tickets/assignTicketToMe",
    async ({ ticketId, agentId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/tickets/${ticketId}/assign`, {
                assigned_to: agentId,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to assign ticket");
        }
    }
);

const ticketsSlice = createSlice({
    name: "tickets",
    initialState: {
        tickets: [],
        ticketDetails: null,
        agentsCache: {},
        loading: false,
        error: null,
    },
    reducers: {
        clearTicketDetails: (state) => {
            state.ticketDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload;
            })
            .addCase(fetchTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(showTicket.pending, (state) => {
                state.loading = true;
            })
            .addCase(showTicket.fulfilled, (state, action) => {
                state.loading = false;
                state.ticketDetails = action.payload;
            })
            .addCase(showTicket.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.tickets.push(action.payload);
            })
            .addCase(updateTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                if (state.ticketDetails?.id === action.payload.id) {
                    state.ticketDetails = action.payload;
                }
            })
            .addCase(deleteTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.filter((t) => t.id !== action.payload);
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                const { projectId, agents } = action.payload;
                state.agentsCache[projectId] = agents;
            })
            .addCase(assignTicketToMe.fulfilled, (state, action) => {
                const { ticket } = action.payload;
                const idx = state.tickets.findIndex((t) => t.id === ticket.id);
                if (idx !== -1) state.tickets[idx] = ticket;
                if (state.ticketDetails?.id === ticket.id) {
                    state.ticketDetails = ticket;
                }
            });
    },
});

export const { clearTicketDetails } = ticketsSlice.actions;
export default ticketsSlice.reducer;