
import { useLocation } from "react-router-dom";

function PlaceholderPage() {
  const location = useLocation();

  const pageName = {
    "/contacts": "Contact Management",
    "/followups": "Follow-up Management",
    "/analytics": "Business Analytics",
    "/settings": "Settings"
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        {pageName[location.pathname]}
      </h1>

      <p className="text-slate-500 mt-2">
        This module is under development.
      </p>
    </div>
  );
}

export default PlaceholderPage;

