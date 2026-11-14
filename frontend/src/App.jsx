
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import {
  Bell,
  Sparkles,
  X,
  Loader2,
  Brain,
  Send,
  Users,
  RefreshCw
} from "lucide-react";

import API from "./services/api";

import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Contacts from "./pages/Contacts.jsx";
import FollowUps from "./pages/Followups.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";


function Topbar() {
  const location = useLocation();

  const [aiOpen, setAiOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState("");
  const [error, setError] = useState("");

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/contacts": "Contacts",
    "/followups": "Follow-ups",
    "/analytics": "Analytics",
    "/settings": "Settings"
  };

  const currentPage = pageTitles[location.pathname] || "Workspace";

  // Load contacts when AI assistant opens
  useEffect(() => {
    if (!aiOpen) return;

    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        setError("");

        const response = await API.get("/contacts");
        const data = response.data;

        const contactList = Array.isArray(data)
          ? data
          : data.contacts || [];

        setContacts(contactList);

        if (contactList.length > 0) {
          setSelectedContactId(contactList[0]._id);
        } else {
          setSelectedContactId("");
        }

      } catch (err) {
        console.error("Loading AI contacts error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load contacts."
        );
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [aiOpen]);

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!selectedContactId) {
      setError("Please select a contact first.");
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      setGenerating(true);
      setError("");
      setInsights("");

      const response = await API.post(
        `/ai/insights/${selectedContactId}`,
        {},
        { signal: controller.signal }
      );

      setInsights(response.data.insights);

    } catch (err) {
      console.error("AI Assistant Error:", err);

      if (
        err.code === "ERR_CANCELED" ||
        err.name === "CanceledError"
      ) {
        setError("AI request timed out. Please try again.");
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to generate AI insights."
        );
      }

    } finally {
      clearTimeout(timeoutId);
      setGenerating(false);
    }
  };

  const selectedContact = contacts.find(
    (contact) => contact._id === selectedContactId
  );

  return (
    <header className="app-topbar">

      <div>
        <p className="topbar-eyebrow">
          BIZCONNECT WORKSPACE
        </p>

        <h2 className="topbar-title">
          {currentPage}
        </h2>
      </div>

      <div className="topbar-actions">

        <div className="topbar-status">
          <span className="status-dot" />
          Workspace active
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="topbar-icon"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </button>

        {/* AI Assistant Button */}
        <button
          type="button"
          onClick={() => setAiOpen((prev) => !prev)}
          className="topbar-icon"
          aria-label="Open AI Assistant"
          title="BizConnect AI Assistant"
          style={{
            background: aiOpen
              ? "#6d4aff"
              : "linear-gradient(135deg, #7856f6, #a16cfb)",
            color: "white",
            boxShadow: "0 5px 15px rgba(124, 87, 255, 0.3)"
          }}
        >
          <Sparkles size={21} />
        </button>

      </div>

      {/* Global AI Assistant Panel */}
      {aiOpen && (
        <div
          className="absolute right-5 top-20 z-50 w-[min(420px,calc(100vw-24px))] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >

          {/* Panel Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Brain size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    BizConnect AI
                  </h3>

                  <p className="text-xs text-purple-100">
                    Your intelligent business assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20"
                aria-label="Close AI Assistant"
              >
                <X size={20} />
              </button>

            </div>
          </div>

          {/* Panel Body */}
          <div className="p-5 space-y-4">

            <div>
              <h4 className="font-semibold text-slate-800">
                What can I help you with?
              </h4>

              <p className="text-sm text-slate-500 mt-1">
                Generate personalized business insights for your contacts.
              </p>
            </div>

            {/* Contact Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select a contact
              </label>

              <div className="relative">
                <Users
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <select
                  value={selectedContactId}
                  onChange={(e) => {
                    setSelectedContactId(e.target.value);
                    setInsights("");
                    setError("");
                  }}
                  disabled={loadingContacts || contacts.length === 0}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  {loadingContacts ? (
                    <option>Loading contacts...</option>
                  ) : contacts.length === 0 ? (
                    <option value="">
                      No contacts available
                    </option>
                  ) : (
                    contacts.map((contact) => (
                      <option
                        key={contact._id}
                        value={contact._id}
                      >
                        {contact.name}
                        {contact.company
                          ? ` - ${contact.company}`
                          : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Selected Contact Information */}
            {selectedContact && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <p className="text-xs text-purple-600 font-semibold mb-1">
                  SELECTED CONTACT
                </p>

                <p className="font-semibold text-slate-800">
                  {selectedContact.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedContact.company || "Company not specified"}
                  {" · "}
                  {selectedContact.category || "Lead"}
                </p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateAIInsights}
              disabled={
                generating ||
                loadingContacts ||
                !selectedContactId
              }
              className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating insights...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Insights
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* AI Result */}
            {insights && (
              <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/60">

                <div className="flex items-center gap-2 text-purple-700 font-semibold mb-3">
                  <Sparkles size={17} />
                  AI Generated Insights
                </div>

                <div className="text-sm text-slate-700 leading-7 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {insights}
                </div>

                <button
                  onClick={generateAIInsights}
                  disabled={generating}
                  className="mt-4 flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Regenerate insights
                </button>

              </div>
            )}

            {/* Empty State */}
            {!insights && !error && !generating && (
              <div className="text-center py-3">
                <Sparkles
                  size={25}
                  className="mx-auto text-purple-400 mb-2"
                />

                <p className="text-xs text-slate-400">
                  Your AI-generated business insights will appear here.
                </p>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t px-5 py-3">
            <p className="text-xs text-slate-400 text-center">
              Powered by Gemini AI · BizConnect
            </p>
          </div>

        </div>
      )}

    </header>
  );
}


function MainLayout() {
  return (
    <div className="app-shell">

      <Sidebar />

      <div className="app-main">

        <Topbar />

        <main className="app-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/followups" element={<FollowUps />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </main>

      </div>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<MainLayout />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
