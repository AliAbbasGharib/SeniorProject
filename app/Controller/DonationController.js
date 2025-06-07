const Question = require('../../Models/Question');
const Answer = require('../../Models/Answer');


// const questions = [
//     {
//         text: "Are you feeling healthy and well today?",
//         type: "yesno",
//         order: 1,
//     },
//     {
//         text: "Have you donated blood in the last 3 months?",
//         type: "yesno",
//         order: 2,
//     },
//     {
//         text: "Are you pregnant or have you been pregnant in the last 6 months?",
//         type: "yesno",
//         order: 3,
//     },
//     {
//         text: "Do you have any chronic medical conditions (e.g., diabetes, heart disease)?",
//         type: "yesno",
//         order: 4,
//     },
//     {
//         text: "Have you taken any antibiotics in the last 7 days?",
//         type: "yesno",
//         order: 5,
//     },
//     {
//         text: "Have you undergone any major surgery in the past 6 months?",
//         type: "yesno",
//         order: 6,
//     },
//     {
//         text: "Do you weigh more than 50 kg (110 lbs)?",
//         type: "yesno",
//         order: 7,
//     },
//     {
//         text: "Have you traveled outside the country in the last 6 months?",
//         type: "yesno",
//         order: 8,
//     },
//     {
//         text: "Have you ever been diagnosed with cancer?",
//         type: "yesno",
//         order: 9,
//     },
//     {
//         text: "Have you received a tattoo or body piercing in the last 6 months?",
//         type: "yesno",
//         order: 10,
//     }
// ];

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
        res.status(200).json({ question });
    } catch (error) {
        console.error("Add question error:", error); // 🔍 Add this
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

        const { answers } = req.body;
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Answers must be a non-empty array' });
        }

        // Fetch the questions corresponding to the submitted answers
        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } });

        // Map question order to answer (for eligibility check)
        const answerMap = new Map();
        for (const ans of answers) {
            const question = questions.find(q => q._id.toString() === ans.questionId);
            if (question) {
                answerMap.set(question.order.toString(), ans.answer.toLowerCase());
            }
        }

        // Check eligibility
        const eligible = checkEligibility(answerMap);

        // Convert answers array into plain object for Mongoose Map field
        const answersMap = {};
        for (const ans of answers) {
            answersMap[ans.questionId] = ans.answer.toLowerCase();
        }

        // Save answers
        const answerDoc = new Answer({ user_id: userId, answers: answersMap, eligible });
        await answerDoc.save();

        res.status(201).json({ eligible });
    } catch (error) {
        console.error('Submit answers error:', error);
        res.status(500).json({ message: 'Failed to submit answers', error: error.message || error });
    }
};
