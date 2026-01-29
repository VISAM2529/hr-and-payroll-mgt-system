import mongoose from 'mongoose';

const jobRequisitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    status: {
        type: String,
        enum: ['Draft', 'Open', 'Closed', 'On Hold'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requirements: [String],
    salaryRange: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' }
    },
    hiringManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetDate: Date
}, {
    timestamps: true
});

const JobRequisition = mongoose.models.JobRequisition || mongoose.model('JobRequisition', jobRequisitionSchema);

export default JobRequisition;
