const { OpenAI } = require('openai');
const Screening = require("../../Models/DonationBlood");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /screening/ai-chat
exports.handleAIChat = async (req, res) => {
    const user_id = req.user._id; // from auth middleware
    const { screeningId, message } = req.body;

    try {
        let screening;

        // Start new session if no ID
        if (!screeningId) {
            screening = new Screening({
                user_id,
                chatHistory: [{ role: 'user', content: message }]
            });
        } else {
            screening = await Screening.findById(screeningId);
            if (!screening || screening.completed) {
                return res.status(400).json({ error: 'Invalid or completed screening session' });
            }
            screening.chatHistory.push({ role: 'user', content: message });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a blood donation health screening assistant. Ask the donor one health or public eligibility question at a time. End with eligibility result after all necessary questions.`
                },
                ...screening.chatHistory
            ]
        });

        const aiReply = response.choices[0].message.content;

        // Save AI response
        screening.chatHistory.push({ role: 'assistant', content: aiReply });

        // Check if AI gave a final verdict
        const lowerReply = aiReply.toLowerCase();
        if (
            lowerReply.includes('you are eligible') ||
            lowerReply.includes('you are not eligible') ||
            lowerReply.includes('not recommended to donate')
        ) {
            screening.completed = true;
            screening.eligible = lowerReply.includes('eligible') && !lowerReply.includes('not');
        }

        await screening.save();

        res.json({
            screeningId: screening._id,
            aiReply,
            completed: screening.completed,
            eligible: screening.eligible ?? null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'AI error', details: err.message });
    }
};
