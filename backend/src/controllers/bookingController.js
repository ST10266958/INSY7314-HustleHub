const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const { audit } = require('../utils/audit');
const { AUDIT_EVENTS } = require('../constants/auditEvents');
const { BOOKING_STATUSES } = require('../constants/bookingStatus');

const createBooking = asyncHandler(async (req, res) => {
  const { gigId } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig || !gig.isActive) {
    audit(AUDIT_EVENTS.BOOKING_REJECTED, { req, outcome: 'failure', details: { reason: 'gig_not_found', gigId } });
    throw new AppError('Gig not found.', 404);
  }

  if (gig.freelancer.toString() === req.user.sub) {
    audit(AUDIT_EVENTS.BOOKING_REJECTED, { req, outcome: 'denied', details: { reason: 'own_gig', gigId } });
    throw new AppError('You cannot book your own gig.', 400);
  }

  const booking = await Booking.create({
    gig: gig._id,
    client: req.user.sub,
    freelancer: gig.freelancer,
    amount: gig.price,
    status: BOOKING_STATUSES.CONFIRMED,
  });

  // No real payment gateway for Part 2 — confirmation is simulated, but a
  // transaction record is still created for every booking as required.
  const transaction = await Transaction.create({
    booking: booking._id,
    client: req.user.sub,
    freelancer: gig.freelancer,
    amount: gig.price,
    status: 'completed',
  });

  audit(AUDIT_EVENTS.BOOKING_CREATED, {
    req,
    details: { bookingId: booking._id, gigId: gig._id, freelancerId: gig.freelancer, amount: gig.price },
  });
  audit(AUDIT_EVENTS.TRANSACTION_RECORDED, {
    req,
    details: { transactionId: transaction._id, bookingId: booking._id, amount: gig.price, status: 'completed' },
  });

  res.status(201).json({
    success: true,
    message: 'Booking confirmed.',
    data: { booking, transaction },
  });
});

const getMyBookingsAsClient = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ client: req.user.sub })
    .populate('gig')
    .populate('freelancer', 'email');
  res.status(200).json({ success: true, data: { bookings } });
});

const getMyBookingsAsFreelancer = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ freelancer: req.user.sub })
    .populate('gig')
    .populate('client', 'email');
  res.status(200).json({ success: true, data: { bookings } });
});

module.exports = { createBooking, getMyBookingsAsClient, getMyBookingsAsFreelancer };
