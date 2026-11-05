const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/Transaction');
const { estimateTaxOnYearToDateIncome, getTaxYearPeriod } = require('../utils/southAfricanTax');

const getMyIncome = asyncHandler(async (req, res) => {
  const freelancerId = new mongoose.Types.ObjectId(req.user.sub);
  const { start, end } = getTaxYearPeriod();

  const [result] = await Transaction.aggregate([
    { $match: { freelancer: freelancerId, status: 'completed' } },
    {
      $facet: {
        lifetime: [
          { $group: { _id: null, totalIncome: { $sum: '$amount' }, completedBookings: { $sum: 1 } } },
        ],
        taxYear: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: null, totalIncome: { $sum: '$amount' }, completedBookings: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const lifetime = result?.lifetime?.[0];
  const taxYear = result?.taxYear?.[0];
  const taxEstimate = estimateTaxOnYearToDateIncome(taxYear?.totalIncome || 0);

  res.status(200).json({
    success: true,
    data: {
      totalIncome: lifetime ? lifetime.totalIncome : 0,
      completedBookings: lifetime ? lifetime.completedBookings : 0,
      taxYearIncome: taxYear ? taxYear.totalIncome : 0,
      taxYearCompletedBookings: taxYear ? taxYear.completedBookings : 0,
      taxEstimate,
    },
  });
});

module.exports = { getMyIncome };
