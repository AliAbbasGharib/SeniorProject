const Question = require('../../Models/Question');
const Answer = require('../../Models/Answer');


const questions = [
    {
        text: "Are you feeling healthy and well today?",
        type: "yesno",
        order: 1,
    },
    {
        text: "Have you donated blood in the last 3 months?",
        type: "yesno",
        order: 2,
    },
    {
        text: "Are you pregnant or have you been pregnant in the last 6 months?",
        type: "yesno",
        order: 3,
    },
    {
        text: "Do you have any chronic medical conditions (e.g., diabetes, heart disease)?",
        type: "yesno",
        order: 4,
    },
    {
        text: "Have you taken any antibiotics in the last 7 days?",
        type: "yesno",
        order: 5,
    },
    {
        text: "Have you undergone any major surgery in the past 6 months?",
        type: "yesno",
        order: 6,
    },
    {
        text: "Do you weigh more than 50 kg (110 lbs)?",
        type: "yesno",
        order: 7,
    },
    {
        text: "Have you traveled outside the country in the last 6 months?",
        type: "yesno",
        order: 8,
    },
    {
        text: "Have you ever been diagnosed with cancer?",
        type: "yesno",
        order: 9,
    },
    {
        text: "Have you received a tattoo or body piercing in the last 6 months?",
        type: "yesno",
        order: 10,
    }
];

// Fetch all questions sorted by order
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort({ order: 1 });
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get questions', error });
    }
};

// Insert a new question
exports.addQuestion = async (req, res) => {
    try {
        const { text, type, order } = req.body;
        const question = new Question({ text, type, order });
        await question.save();
        res.status(201).json({ question });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add question', error });
    }
};

// Eligibility check logic
function checkEligibility(answers) {
    // List of question orders that require "no" for eligibility
    const disqualifyingYes = ['2', '3', '4', '5', '6', '8', '9', '10'];

    // Question 1 (feeling well) must be "yes"
    if (answers.get('1') !== 'yes') return false;

    // Question 7 (weight > 50kg) must be "yes"
    if (answers.get('7') !== 'yes') return false;

    // All disqualifying questions must be "no"
    for (let q of disqualifyingYes) {
        if (answers.get(q) === 'yes') return false;
    }

    return true;
}


// Submit answers and check eligibility
exports.submitAnswers = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { answers } = req.body; // Expected: [{ questionId: "...", answerText: "yes" }, ...]
        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Answers must be a non-empty array' });
        }

        // Convert to Map for eligibility logic (map of questionOrder => answerText)
        const questions = await Question.find(); // You need the question order
        const orderMap = new Map();
        questions.forEach(q => {
            orderMap.set(q._id.toString(), q.order.toString());
        });

        const answerMap = new Map();
        answers.forEach(ans => {
            const order = orderMap.get(ans.questionId);
            if (order) {
                answerMap.set(order, ans.answerText.toLowerCase());
            }
        });

        const eligible = checkEligibility(answerMap);

        const answerDoc = new Answer({
            userId,
            answers,
            eligible
        });

        await answerDoc.save();

        res.status(201).json({ eligible });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit answers', error });
    }
};


