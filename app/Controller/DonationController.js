const Donor = require("../../Models/DonationBlood");

const evaluateEligibility = (responses) => {
    for (let r of responses) {
        const q = r.question.toLowerCase();
        const a = r.answer.toLowerCase();
        if (
            (q.includes("fever") || q.includes("medication") || q.includes("positive") || q.includes("pregnant"))
            && a === "yes"
        ) {
            return false;
        }
    }
    return true;
};

exports.submitScreening = async (req, res) => {
    try {
        const { name, age, gender, contact, bloodType, responses } = req.body;
        const eligible = evaluateEligibility(responses);

        const donor = new Donor({
            name, age, gender, contact, bloodType, responses, eligible
        });

        await donor.save();

        res.status(201).json({ message: 'Screening submitted', eligible });
    } catch (error) {
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};
