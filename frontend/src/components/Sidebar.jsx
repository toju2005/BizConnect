
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  BriefcaseBusiness,
  LogOut,
  Sparkles,
  ChevronRight,
  Zap
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Contacts",
    path: "/contacts",
    icon: Users
  },
  {
    name: "Follow-ups",
    path: "/followups",
    icon: CalendarDays
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesCombined
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings
  }
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="premium-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <BriefcaseBusiness size={24} />
        </div>

        <div>
          <h1>BizConnect</h1>
          <p>BUSINESS OS</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="workspace-card">
        <div className="workspace-avatar">
          <Sparkles size={18} />
        </div>

        <div className="workspace-info">
          <span>WORKSPACE</span>
          <strong>My Business</strong>
        </div>

        <ChevronRight size={16} className="workspace-arrow" />
      </div>

      {/* Navigation */}
      <div className="sidebar-section-label">
        WORKSPACE MENU
      </div>

      <nav className="sidebar-navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} strokeWidth={1.8} />

              <span>{item.name}</span>

              {item.path === "/dashboard" && (
                <span className="sidebar-live-dot" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade card */}
      <div className="sidebar-promo">
        <div className="promo-icon">
          <Zap size={19} />
        </div>

        <h3>Grow Smarter</h3>

        <p>
          Manage your business relationships and track your growth in one place.
        </p>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">

        <div className="sidebar-account">
          <div className="account-avatar">B</div>

          <div className="account-details">
            <strong>BizConnect User</strong>
            <span>Personal Workspace</span>
          </div>

          <span className="account-status" />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout"
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>

        <p className="sidebar-version">
          BIZCONNECT • VERSION 1.0
        </p>

      </div>

    </aside>
  );
}

export default Sidebar;
