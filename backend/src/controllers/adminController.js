const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

const LIST_LIMIT = 200;

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('email role createdAt')
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT);
  res.status(200).json({ success: true, data: { users } });
});

const listGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find()
    .populate('freelancer', 'email')
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT);
  res.status(200).json({ success: true, data: { gigs } });
});

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('gig', 'title price')
    .populate('client', 'email')
    .populate('freelancer', 'email')
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT);
  res.status(200).json({ success: true, data: { bookings } });
});

const listTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate('client', 'email')
    .populate('freelancer', 'email')
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT);
  res.status(200).json({ success: true, data: { transactions } });
});

const deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) {
    throw new AppError('Gig not found.', 404);
  }

  await gig.deleteOne();
  logger.info('Gig removed by admin', { adminId: req.user.sub, gigId: req.params.id });

  res.status(200).json({ success: true, message: 'Gig removed.' });
});

module.exports = { listUsers, listGigs, listBookings, listTransactions, deleteGig };
