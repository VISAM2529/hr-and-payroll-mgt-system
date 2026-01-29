import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Candidate from '@/lib/db/models/recruitment/Candidate';
import { z } from 'zod';

const candidateSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    resumeUrl: z.string().url().optional(),
    jobRequisition: z.string(),
    source: z.enum(['LinkedIn', 'Indeed', 'Referral', 'Website', 'Other']).default('Website'),
    notes: z.string().optional()
});

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');

        let query = {};
        if (jobId) query.jobRequisition = jobId;
        if (status) query.status = status;

        const candidates = await Candidate.find(query)
            .populate('jobRequisition', 'title department')
            .sort({ createdAt: -1 });

        return NextResponse.json({ candidates });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const validatedData = candidateSchema.parse(body);

        const candidate = await Candidate.create(validatedData);
        return NextResponse.json({ candidate, message: "Candidate application received" }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });

        const candidate = await Candidate.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ candidate, message: "Candidate updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
