const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/Transaction');

const getMyIncome = asyncHandler(async (req, res) => {
  const freelancerId = new mongoose.Types.ObjectId(req.user.sub);

  const [summary] = await Transaction.aggregate([
    { $match: { freelancer: freelancerId, status: 'completed' } },
    {
      $group: {
        _id: '$freelancer',
        totalIncome: { $sum: '$amount' },
        completedBookings: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalIncome: summary ? summary.totalIncome : 0,
      completedBookings: summary ? summary.completedBookings : 0,
    },
  });
});

module.exports = { getMyIncome };
