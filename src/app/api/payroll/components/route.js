import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import SalaryComponent from '@/lib/db/models/payroll/SalaryComponent';
import { logActivity } from '@/lib/logger';

export async function GET(request) {
    try {
        await dbConnect();
        const components = await SalaryComponent.find().sort({ displayOrder: 1 });
        return NextResponse.json(components);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const component = await SalaryComponent.create(body);

        await logActivity({
            action: "created",
            entity: "SalaryComponent",
            entityId: component.name,
            description: `Created salary component: ${component.name}`,
            performedBy: { userId: body.createdBy },
            req: request
        });

        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
