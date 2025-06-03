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
  try {
    const user_id = req.user?._id; // from JWT middleware
    const { responses } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const eligible = evaluateEligibility(responses);

    const donor = new Donor({
      user_id,  // Required field from schema
      responses,
      eligible
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

