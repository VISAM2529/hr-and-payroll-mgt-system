import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    questions: [{
        id: String,
        text: String,
        type: { type: String, enum: ["Text", "MultipleChoice", "Rating", "YesNo"], default: "Text" },
        options: [String], // For MultipleChoice
        required: { type: Boolean, default: true }
    }],
    expiryDate: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export default mongoose.models.Survey || mongoose.model("Survey", SurveySchema);
