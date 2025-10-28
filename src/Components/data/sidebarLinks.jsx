import React from "react";
import {
  Home,
  Users,
  Layers,
  Briefcase,
  Ticket,
  ScrollText,
  FileText,
  Shield,
  Palette,
  Building2
} from "lucide-react";

const sidebarLinks = [
  { label: "Dashboard", path: "/dashboard", permissions: null, icon: <Home size={20} /> },
  { label: "User Management", path: "/users", permissions: ["view users"], icon: <Users size={20} /> },
  { label: "Companies", path: "/companies", permissions: ["view companies", "view own companies"], icon: <Building2 size={20} /> },
  { label: "Teams", path: "/teams", permissions: ["view teams"], icon: <Layers size={20} /> },
  { label: "Projects", path: "/projects", permissions: ["view projects", "view own projects"], icon: <Briefcase size={20} /> },
  { label: "Tickets", path: "/tickets", permissions: ["view tickets", "view own tickets"], icon: <Ticket size={20} /> },
  { label: "Contracts", path: "/contracts", permissions: ["view contracts", "view own contracts"], icon: <ScrollText size={20} /> },
  { label: "Invoices", path: "/invoices", permissions: ["view invoices", "view own invoices"], icon: <FileText size={20} /> },
  { label: "Roles", path: "/roles", permissions: ["view Roles"], icon: <Shield size={20} /> },
];

export default sidebarLinks;