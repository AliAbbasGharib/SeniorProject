require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with your API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.AIzaSyCllV0udmg8P8YHeJvH2HXkpaAXCi2rj3o);

async function analyzeDonorAnswer(answer) {
    const promptMessages = [
        {
            "role": "system",
            "content": "You are a medical assistant evaluating if a blood donor is eligible based on their medication."
        },
        {
            "role": "user",
            "content": `Is it safe for someone taking the following medications to donate blood: ${answer}? Please answer Yes or No and explain why.`
        }
    ];

    try {
        // Create a chat completion with Google Gemini
        const model = genAI.getChatModel({ model: "chat-bison-001" }); // or "gemini-pro"
        const response = await model.chat({ messages: promptMessages });

        // response contains the AI's reply
        return response.text;
    } catch (error) {
        console.error("Google Generative AI error:", error);
        return "Unable to process the request at this time.";
    }
}

module.exports = { analyzeDonorAnswer };
