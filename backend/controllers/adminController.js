import Coupon from "../models/Coupon.js";
import University from "../models/University.js";

// Add Coupon
export const addCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ message: "Coupon code and discountPercent are required." });
    }

    const existingCoupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    const coupon = new Coupon({
      code: code.trim().toUpperCase(),
      discountPercent,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await coupon.save();

    res.status(201).json({ message: "Coupon added successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error adding coupon." });
  }
};

// Add University
export const addUniversity = async (req, res) => {
  try {
    const { name, emailDomain } = req.body;

    if (!name || !emailDomain) {
      return res.status(400).json({ message: "University name and email domain are required." });
    }

    const existingUniversity = await University.findOne({ emailDomain: emailDomain.trim().toLowerCase() });
    if (existingUniversity) {
      return res.status(400).json({ message: "University email domain already exists." });
    }

    const university = new University({
      name: name.trim(),
      emailDomain: emailDomain.trim().toLowerCase(),
    });

    await university.save();

    res.status(201).json({ message: "University added successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error adding university." });
  }
};

// Get all coupons with full details for frontend display
export const getCoupons = async (req, res) => {
  try {
    // Return code, discountPercent, expiryDate, and _id for each coupon
    const coupons = await Coupon.find({}, { code: 1, discountPercent: 1, expiryDate: 1, _id: 1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching coupons" });
  }
};

// Get all universities with name and emailDomain
export const getUniversities = async (req, res) => {
  try {
    // Return name and emailDomain fields for each university
    const universities = await University.find({}, { name: 1, emailDomain: 1, _id: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching universities" });
  }
};
