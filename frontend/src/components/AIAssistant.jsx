
import { useState } from "react";
import { Sparkles, X, Loader2, Brain } from "lucide-react";
import API from "../services/api";

function AIAssistant({ contact, onClose }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState("");
  const [error, setError] = useState("");

  const generateInsights = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
  
    try {
      setLoading(true);
      setError("");
      setInsights("");
  
      const response = await API.post(
        `/ai/insights/${contact._id}`,
        {},
        {
          signal: controller.signal,
        }
      );
  
      setInsights(response.data.insights);
    } catch (err) {
      console.error("AI generation error:", err);
  
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
        setError("Gemini is taking too long. Please try again.");
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to generate AI insights."
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Brain className="text-purple-600" size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                AI Business Assistant
              </h2>
              <p className="text-sm text-slate-500">
                Insights for {contact.name}
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {!insights && !error && (
          <div className="text-center py-8">
            <Sparkles
              size={42}
              className="mx-auto text-purple-500 mb-4"
            />

            <h3 className="font-semibold text-lg">
              Ready to analyse this contact?
            </h3>

            <p className="text-slate-500 text-sm mt-2 mb-6">
              Gemini will generate a summary, recommended action
              and professional follow-up message.
            </p>

            <button
              onClick={generateInsights}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate AI Insights
                </>
              )}
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-purple-600 py-5">
            Gemini is analysing your contact...
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            {error}
            <button
              onClick={generateInsights}
              className="block mt-3 underline"
            >
              Try again
            </button>
          </div>
        )}

        {insights && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 text-purple-700 font-semibold">
              <Sparkles size={18} />
              Gemini AI Insights
            </div>

            <div className="whitespace-pre-wrap text-slate-700 leading-7 text-sm">
              {insights}
            </div>

            <button
              onClick={generateInsights}
              className="mt-5 border border-purple-300 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100"
            >
              Regenerate
            </button>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

export default AIAssistant;
