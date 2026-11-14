
import { useEffect, useState } from "react";
import API from "../services/api";
import { CalendarDays, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

function FollowUps() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/contacts");
      const data = response.data;

      const allContacts = Array.isArray(data)
        ? data
        : data.contacts || [];

      setContacts(
        allContacts.filter((contact) => contact.followUpDate)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load follow-ups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // Compare calendar dates without time-zone time differences
  const getDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const today = getDateKey(new Date());

  const getFollowUpDate = (contact) =>
    getDateKey(contact.followUpDate);

  const todayFollowUps = contacts.filter(
    (contact) => getFollowUpDate(contact) === today
  );

  const overdueFollowUps = contacts.filter(
    (contact) => getFollowUpDate(contact) < today
  );

  const upcomingFollowUps = contacts.filter(
    (contact) => getFollowUpDate(contact) > today
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const FollowUpSection = ({ title, items, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-5">
        <Icon className={color} size={22} />
        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>
        <span className="ml-auto bg-slate-100 px-3 py-1 rounded-full text-sm">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-slate-400 text-sm">
          No follow-ups in this section.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((contact) => (
            <div
              key={contact._id}
              className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-semibold text-slate-800">
                  {contact.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {contact.company || "No company"} · {contact.email || "No email"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {contact.phone || "No phone number"}
                </p>
              </div>

              <div className="text-sm text-slate-600">
                <span className="font-medium">Follow-up:</span>{" "}
                {formatDate(contact.followUpDate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Follow-ups
          </h1>
          <p className="text-slate-500 mt-2">
            Keep track of your business conversations and follow-up schedule.
          </p>
        </div>

        <button
          onClick={fetchFollowUps}
          className="flex items-center gap-2 border bg-white px-4 py-3 rounded-lg"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </p>
      )}

      {loading ? (
        <p className="bg-white p-8 rounded-xl text-center">
          Loading follow-ups...
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <CalendarDays className="text-blue-600 mb-3" size={25} />
              <p className="text-slate-500 text-sm">Today's Follow-ups</p>
              <h2 className="text-3xl font-bold mt-1">
                {todayFollowUps.length}
              </h2>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <AlertCircle className="text-red-500 mb-3" size={25} />
              <p className="text-slate-500 text-sm">Overdue Follow-ups</p>
              <h2 className="text-3xl font-bold mt-1">
                {overdueFollowUps.length}
              </h2>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <Clock className="text-green-600 mb-3" size={25} />
              <p className="text-slate-500 text-sm">Upcoming Follow-ups</p>
              <h2 className="text-3xl font-bold mt-1">
                {upcomingFollowUps.length}
              </h2>
            </div>
          </div>

          <FollowUpSection
            title="Overdue Follow-ups"
            items={overdueFollowUps}
            icon={AlertCircle}
            color="text-red-500"
          />

          <FollowUpSection
            title="Today's Follow-ups"
            items={todayFollowUps}
            icon={CalendarDays}
            color="text-blue-600"
          />

          <FollowUpSection
            title="Upcoming Follow-ups"
            items={upcomingFollowUps}
            icon={CheckCircle2}
            color="text-green-600"
          />
        </>
      )}
    </div>
  );
}

export default FollowUps;
