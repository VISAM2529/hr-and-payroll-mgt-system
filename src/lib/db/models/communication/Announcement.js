import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true, // HTML or Rich Text
    },
    type: {
        type: String,
        enum: ["Announcement", "Policy", "Broadcast"],
        default: "Announcement"
    },
    priority: {
        type: String,
        enum: ["Low", "Normal", "High", "Critical"],
        default: "Normal"
    },
    targetAudience: {
        departments: [{ type: String }], // Array of dept names or IDs
        roles: [{ type: String }],       // Array of roles
        all: { type: Boolean, default: true }
    },
    requiresAcknowledgement: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Draft", "Published", "Archived"],
        default: "Draft"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    publishedAt: Date
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
