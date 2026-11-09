const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const { AUDIT_OUTCOMES } = require('../constants/auditEvents');

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
  audit(AUDIT_EVENTS.ADMIN_GIG_REMOVED, { req, details: { gigId: req.params.id } });

  res.status(200).json({ success: true, message: 'Gig removed.' });
});

// Security monitoring: newest audit events first, optionally filtered by event and outcome.
const listAuditLogs = asyncHandler(async (req, res) => {
  // The route validator already whitelists these values. We also look each one up in our own
  // constant lists and compare with $eq, so the query only ever holds a known string, never a raw query value.
  const filter = {};
  const event = Object.values(AUDIT_EVENTS).find((known) => known === req.query.event);
  const outcome = AUDIT_OUTCOMES.find((known) => known === req.query.outcome);
  if (event) filter.event = { $eq: event };
  if (outcome) filter.outcome = { $eq: outcome };
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;

  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.status(200).json({ success: true, data: { logs } });
});

// Counts of events per type and outcome over the last 24 hours (a quick health view for admins).
const getAuditSummary = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await AuditLog.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { event: '$event', outcome: '$outcome' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const summary = rows.map((r) => ({ event: r._id.event, outcome: r._id.outcome, count: r.count }));
  res.status(200).json({ success: true, data: { since: since.toISOString(), summary } });
});

module.exports = {
  listUsers,
  listGigs,
  listBookings,
  listTransactions,
  deleteGig,
  listAuditLogs,
  getAuditSummary,
};
