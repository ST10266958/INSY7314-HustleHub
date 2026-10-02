const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const Gig = require('../models/Gig');

async function loadOwnedGig(req) {
  const gig = await Gig.findById(req.params.id);

  // Same 404 whether the gig doesn't exist or just isn't theirs — don't
  // reveal that someone else's gig exists at this id.
  if (!gig || gig.freelancer.toString() !== req.user.sub) {
    throw new AppError('Gig not found.', 404);
  }
  return gig;
}

const createGig = asyncHandler(async (req, res) => {
  const { title, description, price, category } = req.body;

  const gig = await Gig.create({
    title,
    description,
    price,
    category,
    freelancer: req.user.sub,
  });

  res.status(201).json({ success: true, message: 'Gig created.', data: { gig } });
});

const listGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ isActive: true }).populate('freelancer', 'email role');
  res.status(200).json({ success: true, data: { gigs } });
});

const getMyGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ freelancer: req.user.sub });
  res.status(200).json({ success: true, data: { gigs } });
});

const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('freelancer', 'email role');
  if (!gig) {
    throw new AppError('Gig not found.', 404);
  }
  res.status(200).json({ success: true, data: { gig } });
});

const updateGig = asyncHandler(async (req, res) => {
  const gig = await loadOwnedGig(req);
  const { title, description, price, category, isActive } = req.body;

  if (title !== undefined) gig.title = title;
  if (description !== undefined) gig.description = description;
  if (price !== undefined) gig.price = price;
  if (category !== undefined) gig.category = category;
  if (isActive !== undefined) gig.isActive = isActive;

  await gig.save();
  res.status(200).json({ success: true, message: 'Gig updated.', data: { gig } });
});

const deleteGig = asyncHandler(async (req, res) => {
  const gig = await loadOwnedGig(req);
  await gig.deleteOne();
  res.status(200).json({ success: true, message: 'Gig deleted.' });
});

module.exports = { createGig, listGigs, getMyGigs, getGigById, updateGig, deleteGig };
