const OpenAI = require('openai');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key in environment variables');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const healthQuestions = [
    "Do you have any chronic diseases (e.g. diabetes, heart disease)?",
    "Have you had a fever or cold in the past week?",
    "Are you currently taking any medication?",
    "Have you donated blood in the last 3 months?",
    "Do you weigh more than 50kg?",
    "Are you between the ages of 18 and 65?",
];

async function checkEligibility(answers) {
    if (answers.length !== healthQuestions.length) {
        throw new Error('Mismatch between number of answers and questions');
    }

    const prompt = `
You are a medical screening assistant for blood donation.

Here are the donor's answers:
${answers.map((ans, i) => `${i + 1}. ${healthQuestions[i]} - ${ans}`).join('\n')}

Based on WHO guidelines, is this person eligible to donate blood? Reply with either:
- "Eligible"
- "Not Eligible"
And explain briefly why.
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI API error:", error);
        return "Error evaluating eligibility.";
    }
}

module.exports = { healthQuestions, checkEligibility };
