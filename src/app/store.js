import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import usersReducer from "../features/usersSlice";
import dashboardReducer from "../features/dashboardSlice";
import roloesReducer from "../features/rolesSlice";
import permissionsReducer from "../features/permissionSlice";
import companiesReducer from "../features/companiesSlice"
import teamsReducer from "../features/teamsSlice";
import projectsReducer from "../features/projectsSlice";
import ticketsReducer from "../features/ticketsSlice";
import contractsReducer from "../features/contractsSlice";
import invoicesReducer from "../features/invoicesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    roles:roloesReducer,
    permissions:permissionsReducer,
    companies:companiesReducer,
    teams:teamsReducer,
    projects:projectsReducer,
    tickets:ticketsReducer,
    contracts:contractsReducer,
    invoices:invoicesReducer,
  },
});

export default store;