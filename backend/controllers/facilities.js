const Facility = require("../models/Facility");

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
