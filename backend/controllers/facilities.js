const { isObjectIdOrHexString } = require("mongoose");
const Booking = require("../models/Booking");
const Facility = require("../models/Facility");

const formatTime = (minutes) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

exports.getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  } catch (error) {
    next(error);
  }
};

exports.getFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOne({ _id: req.params.id, isActive: true });
    if (!facility) return res.status(404).json({ success: false, error: "Facility not found" });
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

exports.getFacilityAvailability = async (req, res, next) => {
  const { id } = req.params;
  const { date, exclude } = req.query;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, error: "Date must be in YYYY-MM-DD format" });
  }
  const bookingDate = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(bookingDate.getTime()) || bookingDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ success: false, error: "Invalid booking date" });
  }
  if (!isObjectIdOrHexString(id) || (exclude !== undefined && !isObjectIdOrHexString(exclude))) {
    return res.status(400).json({ success: false, error: "Invalid facility or booking ID" });
  }

  try {
    if (!await Facility.exists({ _id: id, isActive: true })) {
      return res.status(404).json({ success: false, error: "Facility not found" });
    }
    const filter = { facility: id, bookingDate, ...(exclude ? { _id: { $ne: exclude } } : {}) };
    const bookings = await Booking.find(filter)
      .select({ _id: 0, startMinutes: 1, endMinutes: 1 })
      .sort({ startMinutes: 1 })
      .lean();
    const booked = bookings.map(({ startMinutes, endMinutes }) => ({
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
    }));
    res.set("Cache-Control", "no-store").status(200).json({ success: true, data: { date, booked } });
  } catch (error) {
    next(error);
  }
};

exports.createFacility = async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

exports.updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    if (!facility) return res.status(404).json({ success: false, error: "Facility not found" });
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    next(error);
  }
};

exports.deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!facility) return res.status(404).json({ success: false, error: "Facility not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
