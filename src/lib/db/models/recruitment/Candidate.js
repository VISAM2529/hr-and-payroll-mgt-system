import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Candidate name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: String,
    resumeUrl: String,
    jobRequisition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobRequisition',
        required: true
    },
    status: {
        type: String,
        enum: [
            'Applied',
            'Screening',
            'Technical Interview',
            'Managerial Interview',
            'HR Interview',
            'Offer Sent',
            'Hired',
            'Rejected',
            'Withdrawn'
        ],
        default: 'Applied'
    },
    interviews: [{
        round: String,
        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        date: Date,
        feedback: String,
        rating: { type: Number, min: 1, max: 5 },
        status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
    }],
    source: {
        type: String,
        enum: ['LinkedIn', 'Indeed', 'Referral', 'Website', 'Other'],
        default: 'Website'
    },
    notes: String,
    appliedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

export default Candidate;
