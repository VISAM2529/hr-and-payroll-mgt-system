import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import SalaryComponent from '@/lib/db/models/payroll/SalaryComponent';
import { logActivity } from '@/lib/logger';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const component = await SalaryComponent.findByIdAndUpdate(id, body, { new: true });

        await logActivity({
            action: "updated",
            entity: "SalaryComponent",
            entityId: component.name,
            description: `Updated salary component: ${component.name}`,
            performedBy: { userId: body.updatedBy },
            req: request
        });

        return NextResponse.json(component);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const component = await SalaryComponent.findByIdAndDelete(id);

        return NextResponse.json({ message: "Component deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
