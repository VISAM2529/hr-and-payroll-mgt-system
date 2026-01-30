import mongoose from "mongoose";

const AcknowledgementSchema = new mongoose.Schema({
    announcementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
        required: true,
        index: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId, // Could be User or Employee Schema
        ref: "Employee",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Viewed", "Accepted"],
        default: "Pending"
    },
    viewedAt: Date,
    acceptedAt: Date,
}, { timestamps: true });

// Ensure unique acknowledgement per announcement per employee
AcknowledgementSchema.index({ announcementId: 1, employeeId: 1 }, { unique: true });

export default mongoose.models.Acknowledgement || mongoose.model("Acknowledgement", AcknowledgementSchema);
