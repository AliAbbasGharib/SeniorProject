require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with correct API key from .env
const genAI = new GoogleGenerativeAI(process.env.AIzaSyCllV0udmg8P8YHeJvH2HXkpaAXCi2rj3o);

exports.analyzeDonorAnswer = async (answer, req) => {
    const userId = req.user?.id || "Unknown";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
You are a medical assistant evaluating if a blood donor is eligible based on their medication.

User ID: ${userId}

Question: Is it safe for someone taking the following medications to donate blood?

Medications: ${answer}

Please respond with:
- Decision: Yes or No
- Reason: Short explanation.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        return text;
    } catch (error) {
        console.error("Gemini AI error:", error.message);
        return "Unable to process the request at this time.";
    }
};
