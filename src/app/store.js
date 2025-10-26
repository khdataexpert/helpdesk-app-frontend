import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import usersReducer from "../features/usersSlice";
import dashboardReducer from "../features/dashboardSlice";
import roloesReducer from "../features/rolesSlice";
import permissionsReducer from "../features/permissionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    roles:roloesReducer,
    permissions:permissionsReducer
  },
});

export default store;
