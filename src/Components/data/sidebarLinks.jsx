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
  Palette
} from "lucide-react";

/**
 * sidebarLinks
 * - label: translation key (used with i20n `t(label)`)
 * - path: react-router path
 * - icon: JSX node (lucide-react)
 * - permission: permission string required to show this link (null = always visible)
 *
 * NOTE: for the Theme/Style link we use the companies-related permission your backend exposes.
 * I used "edit companies" so only users allowed to edit company data can change styles.
 */
const sidebarLinks = [
  { label: "Dashboard", path: "/dashboard", permission: null, icon: <Home size={20} /> },
  { label: "User Management", path: "/users", permission: "view users", icon: <Users size={20} /> },
  { label: "Teams", path: "/teams", permission: "view teams", icon: <Layers size={20} /> },
  { label: "Projects", path: "/projects", permission: "view projects", icon: <Briefcase size={20} /> },
  { label: "Tickets", path: "/tickets", permission: "view tickets", icon: <Ticket size={20} /> },
  { label: "Contracts", path: "/contracts", permission: "view contracts", icon: <ScrollText size={20} /> },
  { label: "Invoices", path: "/invoices", permission: "view invoices", icon: <FileText size={20} /> },
  { label: "Roles", path: "/roles", permission: "view Roles", icon: <Shield size={20} /> },
];


export default sidebarLinks;
