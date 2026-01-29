import mongoose from 'mongoose';

const offerLetterSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    salary: {
        amount: Number,
        currency: { type: String, default: 'INR' },
        frequency: { type: String, default: 'Yearly' }
    },
    joiningDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'],
        default: 'Draft'
    },
    expiryDate: Date,
    terms: [String],
    documentUrl: String, // Link to generated PDF if any
    content: String, // Markdown or HTML content
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    signedAt: Date
}, {
    timestamps: true
});

const OfferLetter = mongoose.models.OfferLetter || mongoose.model('OfferLetter', offerLetterSchema);

export default OfferLetter;
