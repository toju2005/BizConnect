
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

import {
  Users,
  UserCheck,
  Target,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

function Analytics() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real contact data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/contacts");
      const data = response.data;

      setContacts(
        Array.isArray(data) ? data : data.contacts || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const total = contacts.length;

    const leads = contacts.filter(
      (c) => c.category === "Lead"
    ).length;

    const converted = contacts.filter(
      (c) => c.status === "Converted"
    ).length;

    const scheduled = contacts.filter(
      (c) => c.followUpDate
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = contacts.filter((c) => {
      if (!c.followUpDate) return false;

      const date = new Date(c.followUpDate);
      date.setHours(0, 0, 0, 0);

      return date < today;
    }).length;

    const conversionRate = total
      ? ((converted / total) * 100).toFixed(1)
      : "0.0";

    return {
      total,
      leads,
      converted,
      scheduled,
      overdue,
      conversionRate,
    };
  }, [contacts]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = [
      "Lead",
      "Client",
      "Customer",
      "Supplier",
      "Other",
    ];

    return categories.map((category) => ({
      name: category,
      value: contacts.filter(
        (c) => c.category === category
      ).length,
    }));
  }, [contacts]);

  // Status distribution
  const statusData = useMemo(() => {
    const statuses = [
      "New",
      "Contacted",
      "Qualified",
      "Converted",
      "Lost",
    ];

    return statuses.map((status) => ({
      name: status,
      count: contacts.filter(
        (c) => c.status === status
      ).length,
    }));
  }, [contacts]);

  // Monthly contact growth (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      const month = date.getMonth();
      const year = date.getFullYear();

      const count = contacts.filter((contact) => {
        if (!contact.createdAt) return false;

        const created = new Date(contact.createdAt);

        return (
          created.getMonth() === month &&
          created.getFullYear() === year
        );
      }).length;

      months.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        contacts: count,
      });
    }

    return months;
  }, [contacts]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-slate-50">
        <p className="text-center bg-white p-8 rounded-xl">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Business Analytics
          </h1>

          <p className="text-slate-500 mt-2">
            Understand your contacts, leads and business growth.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center justify-center gap-2 border bg-white px-4 py-3 rounded-lg hover:bg-slate-100"
        >
          <RefreshCw size={18} />
          Refresh Analytics
        </button>
      </div>

      {error && (
        <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-6">
          {error}
        </p>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <StatCard
          title="Total Contacts"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-100"
        />

        <StatCard
          title="Total Leads"
          value={stats.leads}
          icon={Target}
          color="text-orange-600"
          bg="bg-orange-100"
        />

        <StatCard
          title="Converted Contacts"
          value={stats.converted}
          icon={UserCheck}
          color="text-green-600"
          bg="bg-green-100"
        />

        <StatCard
          title="Scheduled Follow-ups"
          value={stats.scheduled}
          icon={CalendarDays}
          color="text-purple-600"
          bg="bg-purple-100"
        />

      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-green-600" size={22} />
            <h2 className="font-semibold text-slate-800">
              Conversion Rate
            </h2>
          </div>

          <h3 className="text-4xl font-bold text-slate-900">
            {stats.conversionRate}%
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Converted contacts divided by all contacts.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-500" size={22} />
            <h2 className="font-semibold text-slate-800">
              Overdue Follow-ups
            </h2>
          </div>

          <h3 className="text-4xl font-bold text-slate-900">
            {stats.overdue}
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Contacts whose scheduled follow-up date has passed.
          </p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5">
            Contact Categories
          </h2>

          {stats.total === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData
                    .filter((item) => item.value > 0)
                    .map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5">
            Contact Status
          </h2>

          {stats.total === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Monthly Growth */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          Monthly Contact Growth
        </h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="contacts"
              name="New Contacts"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        Analytics are calculated from the contacts currently returned by your account API.
      </p>

    </div>
  );
}

// Reusable statistics card
function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-xl`}>
          <Icon size={25} />
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[300px] flex items-center justify-center text-slate-400">
      No contact data available yet.
    </div>
  );
}

export default Analytics;
