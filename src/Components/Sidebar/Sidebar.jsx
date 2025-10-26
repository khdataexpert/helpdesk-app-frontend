import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import sidebarLinks from "../data/sidebarLinks";
import i18n from "../../utils/i18n";
import { logoutUser } from "../../features/authSlice";
import { LogOut } from "lucide-react";

const Sidebar = ({ closeSidebar }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [isRTL, setIsRTL] = useState(i18n.language === "ar");
  const permissions = user?.permissions || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const lowerPerms = permissions.map(p => p.toLowerCase());

  const filteredLinks = sidebarLinks.filter((link) => {
    if (!link.permission) return true;
    const lowerLinkPerm = link.permission.toLowerCase();
    let ownPerm = null;
    if (lowerLinkPerm.startsWith("view ")) {
      ownPerm = lowerLinkPerm.replace("view ", "view own ");
    }
    return lowerPerms.includes(lowerLinkPerm) || (ownPerm && lowerPerms.includes(ownPerm));
  });

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-2xl text-[18px] font-medium 
         transition-all duration-300 ease-in-out
         ${isActive
      ? "bg-[var(--secondary-color)] text-[var(--text-color)] shadow-md"
      : "text-[var(--text-color)] hover:bg-[var(--hover-color)] hover:shadow-md"
    }`;

  return (
    <aside
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="w-64 bg-[var(--primary-color)] h-screen flex flex-col p-5"
    >
      <div className="flex justify-between items-center mb-8 border-b-1 border-white pb-3">
        <div>
          <h2 className="text-[var(--background-color)] text-2xl font-bold tracking-wide">
            {user?.company?.name || t("Company Name")}
          </h2>
          <p className="text-[var(--text-color)] text-sm font-normal opacity-80 pt-2">
            {user?.email}
          </p>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden text-[var(--text-color)] text-xl font-semibold focus:outline-none transition-transform duration-500 hover:rotate-180"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {filteredLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={navLinkClass}>
            <span className="text-[var(--text-color)]">{link.icon}</span>
            <span>{t(link.label)}</span>
          </NavLink>
        ))}
      </nav>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 p-2 bg-[var(--text-color)] text-white rounded-2xl text-[18px] font-medium 
         hover:bg-sky-900 hover:text-[var(--secondary-color)] hover:shadow-md transition-all duration-300 ease-in-out  "
      >
        <LogOut size={18} />
        <span>{isRTL ? "تسجيل الخروج" : "Logout"}</span>
      </button>
    </aside>
  );
};

export default Sidebar;