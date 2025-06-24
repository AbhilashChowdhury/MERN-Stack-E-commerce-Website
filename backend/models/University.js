import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  emailDomain: { type: String, required: true, trim: true, lowercase: true, unique: true },
}, { timestamps: true });

const University = mongoose.model("University", universitySchema);

export default University;
