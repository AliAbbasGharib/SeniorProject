const { GoogleGenerativeAI } = require("@google/generative-ai");

const openai = new GoogleGenerativeAI(process.env.AIzaSyCllV0udmg8P8YHeJvH2HXkpaAXCi2rj3o);

exports.analyzeDonorAnswer = async (answer) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent([
            {
                role: "user",
                parts: [
                    {
                        text: `Is it safe for someone taking the following medications to donate blood: ${answer}? Please answer Yes or No and explain why.`,
                    },
                ],
            },
        ]);

        const response = await result.response;
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Gemini API error:", error.message);
        return "Unable to process the request at this time.";
    }
};
