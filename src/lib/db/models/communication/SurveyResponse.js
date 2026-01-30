import mongoose from "mongoose";

const SurveyResponseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey",
        required: true,
        index: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    answers: [{
        questionId: String,
        answer: mongoose.Schema.Types.Mixed // String, Number, or Array
    }]
}, { timestamps: true });

export default mongoose.models.SurveyResponse || mongoose.model("SurveyResponse", SurveyResponseSchema);
