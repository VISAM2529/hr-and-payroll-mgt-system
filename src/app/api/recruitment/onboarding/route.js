import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import OnboardingChecklist from '@/lib/db/models/recruitment/OnboardingChecklist';
import Employee from '@/lib/db/models/payroll/Employee';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');

        let query = {};
        if (employeeId) query.employee = employeeId;

        const checklists = await OnboardingChecklist.find(query).populate('employee', 'personalDetails employmentDetails');
        return NextResponse.json({ checklists });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const checklist = await OnboardingChecklist.create(body);
        return NextResponse.json({ checklist, message: "Onboarding checklist created" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;

        const checklist = await OnboardingChecklist.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ checklist, message: "Checklist updated" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
