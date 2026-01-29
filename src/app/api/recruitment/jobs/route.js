import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import JobRequisition from '@/lib/db/models/recruitment/JobRequisition';
import { z } from 'zod';

const jobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    department: z.string().min(1, "Department is required"),
    location: z.string().min(1, "Location is required"),
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
    description: z.string().min(10, "Description must be at least 10 characters"),
    requirements: z.array(z.string()).optional(),
    salaryRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        currency: z.string().default('INR')
    }).optional(),
    targetDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
});

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const department = searchParams.get('department');

        let query = {};
        if (status) query.status = status;
        if (department) query.department = department;

        const jobs = await JobRequisition.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ jobs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const validatedData = jobSchema.parse(body);

        const job = await JobRequisition.create(validatedData);
        return NextResponse.json({ job, message: "Job requisition created successfully" }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
