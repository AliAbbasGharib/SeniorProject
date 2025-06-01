const { GoogleGenerativeAI } = require("@google/generative-ai");
const Screening = require("../models/Screening");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.AIzaSyCllV0udmg8P8YHeJvH2HXkpaAXCi2rj3o);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.startScreening = async (req, res) => {
    try {
        const prompt = `
You are a medical assistant evaluating blood donors. Ask 1 health question at a time. Ask your first question now.
`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const question = response.text();

        const screening = new Screening({
            userId: req.body.userId,
            messages: [{ role: "AI", content: question }]
        });

        await screening.save();

        res.json({ question, sessionId: screening._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "AI failed to start screening." });
    }
};

exports.continueScreening = async (req, res) => {
    try {
        const { sessionId, answer } = req.body;
        const screening = await Screening.findById(sessionId);
        if (!screening) return res.status(404).json({ error: "Session not found." });

        screening.messages.push({ role: "user", content: answer });

        const history = screening.messages.map(m => `${m.role === "2001" ? "Donor" : "AI"}: ${m.content}`).join("\n");

        const result = await model.generateContent(history);
        const response = await result.response;
        const aiReply = response.text();

        screening.messages.push({ role: "AI", content: aiReply });

        // If AI says "You're eligible" or "Not eligible" – treat it as final
        if (aiReply.includes("Eligible")) {
            screening.result = aiReply;
        }

        await screening.save();

        res.json({ reply: aiReply, finished: Boolean(screening.result) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "AI failed to continue screening." });
    }
};
