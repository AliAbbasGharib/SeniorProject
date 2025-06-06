const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
console.log(process.env.OPENAI_API_KEY);
const healthQuestions = [
    "Do you have any chronic diseases (e.g. diabetes, heart disease)?",
    "Have you had a fever or cold in the past week?",
    "Are you currently taking any medication?",
    "Have you donated blood in the last 3 months?",
    "Do you weigh more than 50kg?",
    "Are you between the ages of 18 and 65?",
];

async function checkEligibility(answers) {
    const prompt = `
You are a medical screening assistant for blood donation.

Here are the donor's answers:
${answers.map((ans, i) => `${i + 1}. ${healthQuestions[i]} - ${ans}`).join('\n')}

Based on WHO guidelines, is this person eligible to donate blood? Reply with either:
- "Eligible"
- "Not Eligible"
And explain briefly why.
`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content.trim();
}

module.exports = { healthQuestions, checkEligibility };
