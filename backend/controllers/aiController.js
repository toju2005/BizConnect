
const Contact = require("../models/Contact.js");
const getGeminiClient = require("../config/gemini.js");

const generateInsights = async (req, res) => {
  try {
    // Find the contact belonging to the logged-in user
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found.",
      });
    }

    // Prepare contact information for Gemini
    const prompt = `
You are an intelligent business CRM assistant.

Analyse the following contact information and provide useful business insights.

Contact Name: ${contact.name || "Not provided"}
Email: ${contact.email || "Not provided"}
Phone: ${contact.phone || "Not provided"}
Company: ${contact.company || "Not provided"}
Job Title: ${contact.jobTitle || "Not provided"}
Category: ${contact.category || "Not provided"}
Status: ${contact.status || "Not provided"}
Notes: ${contact.notes || "No notes available"}
Next Follow-up: ${
      contact.followUpDate
        ? new Date(contact.followUpDate).toLocaleDateString()
        : "Not scheduled"
    }

Provide your response using these three headings:

1. CONTACT SUMMARY
Write a short summary of this business relationship.

2. RECOMMENDED ACTION
Suggest one practical next step based only on the available information.
Do not invent facts.

3. FOLLOW-UP MESSAGE
Write a short, professional message suitable for contacting this person.

Keep the response concise and easy to understand.
`;

    // Connect to Gemini
    const ai = await getGeminiClient();

    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          maxOutputTokens: 400,
          temperature: 0.4,
        },
      });

    return res.status(200).json({
      success: true,
      contactName: contact.name,
      insights: response.text,
    });

  } catch (error) {
    console.error("AI Insights Error:", error);

    return res.status(500).json({
      message: "Unable to generate AI insights.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = { generateInsights };
