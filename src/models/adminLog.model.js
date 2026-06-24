import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  adminId:    { type: String, required: true },
  action:     { type: String, required: true },
  resource:   { type: String, required: true },
  resourceId: { type: Number },
  before:     { type: mongoose.Schema.Types.Mixed },
  after:      { type: mongoose.Schema.Types.Mixed },
  ip:         { type: String },
  timestamp:  { type: Date, default: Date.now },
});

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

export default AdminLog;
