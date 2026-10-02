const mongoose = require('mongoose');
const { BOOKING_STATUSES } = require('../constants/bookingStatus');

const bookingSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      default: BOOKING_STATUSES.CONFIRMED,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
