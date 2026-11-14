
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Search,
  Users,
  RefreshCw,
  Plus,
  X,
  CalendarDays,
  Trash2,
  Sparkles
} from "lucide-react";

import AIAssistant from "../components/AIAssistant";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  category: "Lead",
  status: "New",
  followUpDate: "",
  notes: "",
};

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch contacts from MongoDB
  const fetchContacts = async () => {
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
        err.response?.data?.message || "Unable to load contacts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create a new contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await API.post("/contacts", {
        ...formData,
        followUpDate: formData.followUpDate || null,
      });

      setFormData(initialForm);
      setShowForm(false);

      await fetchContacts();
    } catch (err) {
      console.error(
        "Contact creation error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to save contact."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a contact
  const handleDelete = async (contactId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(contactId);
      setError("");

      await API.delete(`/contacts/${contactId}`);

      setContacts((prevContacts) =>
        prevContacts.filter(
          (contact) => contact._id !== contactId
        )
      );
    } catch (err) {
      console.error(
        "Contact deletion error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete contact."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Search contacts
  const filteredContacts = contacts.filter((contact) =>
    `${contact.name || ""} ${contact.email || ""} ${contact.company || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Format follow-up date
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Contacts
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your business relationships.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 border bg-white px-4 py-3 rounded-lg"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-5">
          {error}
        </p>
      )}

      {/* Add Contact Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Add New Contact
            </h2>

            <button onClick={() => setShowForm(false)}>
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {[
                ["name", "Full Name"],
                ["email", "Email"],
                ["phone", "Phone Number"],
                ["company", "Company"],
                ["jobTitle", "Job Title"],
                ["category", "Category"],
                ["status", "Status"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-2">
                    {label}
                    {name === "name" && " *"}
                  </label>

                  {name === "category" || name === "status" ? (
                    <select
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {(name === "category"
                        ? ["Lead", "Client", "Customer", "Supplier", "Other"]
                        : ["New", "Contacted", "Qualified", "Converted", "Lost"]
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={name}
                      type={name === "email" ? "email" : "text"}
                      value={formData[name]}
                      onChange={handleChange}
                      required={name === "name"}
                      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              {/* Next Follow-up Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <CalendarDays size={16} />
                  Next Follow-up Date
                </label>

                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-slate-500 mt-1">
                  Schedule when you want to contact this person again.
                </p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional information..."
                />
              </div>

            </div>

            {/* Form Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Contact"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="           Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {loading ? (
          <p className="p-8 text-center">
            Loading contacts...
          </p>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300 mb-3"
            />

            <h3 className="font-semibold text-slate-700">
              No contacts found
            </h3>

            <p className="text-slate-500 mt-2">
              Add your first business contact.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Next Follow-up</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-4 font-medium">
                      {contact.name}
                    </td>

                    <td className="p-4">
                      {contact.email || "-"}
                    </td>

                    <td className="p-4">
                      {contact.phone || "-"}
                    </td>

                    <td className="p-4">
                      {contact.company || "-"}
                    </td>

                    <td className="p-4">
                      {contact.category || "Lead"}
                    </td>

                    <td className="p-4">
                      {contact.status || "New"}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {formatDate(contact.followUpDate)}
                    </td>

                    {/* AI and Delete Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-lg transition whitespace-nowrap"
                        >
                          <Sparkles size={16} />
                          AI Insights
                        </button>

                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                          title="Delete contact"
                          className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingId === contact._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      {selectedContact && (
        <AIAssistant
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}

    </div>
  );
}

export default Contacts;
