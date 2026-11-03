const Student = require("../models/Student");

async function getProfile(req, res, next) {
  try {
    const student = await Student.findById(req.user.id)
      .select("name registerNumber email phone department year role createdAt")
      .lean();
    if (!student) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, student });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) return res.status(400).json({ success: false, message: "Valid name is required" });
      updates.name = name.trim();
    }
    if (phone !== undefined) {
      if (typeof phone !== "string" || !/^\+?[0-9]{10,15}$/.test(phone.trim())) return res.status(400).json({ success: false, message: "Valid phone number is required" });
      updates.phone = phone.trim();
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: "No profile fields supplied" });

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    ).select("name registerNumber email phone department year role");
    if (!student) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, message: "Profile updated", student });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };