const Donor = require("../../Models/DonationBlood");


const evaluateEligibility = (responses) => {
    return !responses.some(r =>
        r.answer.toLowerCase() === 'yes' &&
        ['fever', 'medication', 'positive', 'pregnant'].some(keyword =>
            r.question.toLowerCase().includes(keyword)
        )
    );
};

exports.submitScreening = async (req, res) => {
    const userId = req.user?.id; // optional chaining
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({ error: 'Responses are required' });
    }

    try {
        const eligible = evaluateEligibility(responses);

        const donor = new Donor({
            userId,
            responses,
            eligible,
            createdAt: new Date()
        });

        await donor.save();

        res.status(201).json({
            message: 'Screening submitted successfully',
            eligible
        });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
