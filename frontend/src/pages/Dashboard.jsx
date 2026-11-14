
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  Users,
  UserPlus,
  BriefcaseBusiness,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  CalendarDays
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    leads: 0,
    clients: 0,
    conversions: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real contact data from MongoDB
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Request a large page so category statistics use
      // the complete contact list, not just the first 10.
      const response = await API.get("/contacts?limit=1000");

      const data = response.data;
      const contactList = Array.isArray(data)
        ? data
        : data.contacts || [];

      // Calculate statistics from actual contacts
      const total = data.pagination?.total ?? contactList.length;

      const leads = contactList.filter(
        (contact) => contact.category === "Lead"
      ).length;

      const clients = contactList.filter(
        (contact) => contact.category === "Client"
      ).length;

      const conversions = contactList.filter(
        (contact) => contact.status === "Converted"
      ).length;

      setStats({
        total,
        leads,
        clients,
        conversions
      });

      // Sort newest contacts first
      const recentContacts = [...contactList]
        .sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, 5);

      setContacts(recentContacts);

    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dashboard statistics
  const statCards = [
    {
      title: "Total Contacts",
      value: stats.total,
      description: "All saved contacts",
      icon: Users,
      color: "text-blue-600",
      background: "bg-blue-100"
    },
    {
      title: "New Leads",
      value: stats.leads,
      description: "Potential business leads",
      icon: UserPlus,
      color: "text-purple-600",
      background: "bg-purple-100"
    },
    {
      title: "Active Clients",
      value: stats.clients,
      description: "Contacts categorized as clients",
      icon: BriefcaseBusiness,
      color: "text-cyan-700",
      background: "bg-cyan-100"
    },
    {
      title: "Conversions",
      value: stats.conversions,
      description: "Successfully converted contacts",
      icon: TrendingUp,
      color: "text-emerald-600",
      background: "bg-emerald-100"
    }
  ];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-8 min-h-screen">

      {/* Dashboard Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-600 mt-2">
            Your business overview, powered by live contact data.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Dashboard
        </button>

      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-2xl border shadow-sm"
            >

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    {stat.title}
                  </p>
                </div>

                <div className={`${stat.background} ${stat.color} p-3 rounded-xl`}>
                  <Icon size={23} />
                </div>

              </div>

              <h2 className="text-3xl font-bold text-slate-900 mt-5">
                {loading ? "..." : stat.value}
              </h2>

              <p className="text-slate-500 text-xs mt-2">
                {stat.description}
              </p>

            </div>
          );
        })}

      </div>

      {/* Recent Contacts */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 flex flex-wrap justify-between items-center gap-3">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Contacts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Your five most recently added contacts.
            </p>
          </div>

          <button
            onClick={() => navigate("/contacts")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            View All
            <ArrowUpRight size={17} />
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Added On</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    Loading your contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <Users
                      size={35}
                      className="mx-auto text-slate-400 mb-3"
                    />

                    <p className="font-semibold text-slate-700">
                      No contacts available
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Add your first business contact to get started.
                    </p>

                    <button
                      onClick={() => navigate("/contacts")}
                      className="mt-4 text-blue-600 font-medium hover:underline"
                    >
                      Add Contact
                    </button>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="border-t hover:bg-slate-50 transition"
                  >

                    <td className="p-4 font-semibold text-slate-800">
                      {contact.name}
                    </td>

                    <td className="p-4 text-slate-600">
                      {contact.company || "-"}
                    </td>

                    <td className="p-4 text-slate-600">
                      {contact.email || "-"}
                    </td>

                    <td className="p-4">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        {contact.category || "Other"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {contact.status || "New"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={15} />
                        {formatDate(contact.createdAt)}
                      </span>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Dashboard Footer */}
      <div className="mt-6 text-center text-xs text-slate-500">
        BizConnect CRM · Live database statistics
      </div>

    </div>
  );
}

export default Dashboard;
