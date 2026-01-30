import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Can be User or Employee depending on auth flow implementation
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // To User/Employee ID
        required: true
    },
    subject: String,
    content: {
        type: String, // Encrypted content ideally
        required: true
    },
    readAt: Date,
    isArchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
