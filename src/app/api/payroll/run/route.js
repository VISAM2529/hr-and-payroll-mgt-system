import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import PayrollRun from '@/lib/db/models/payroll/PayrollRun';
import Organization from '@/lib/db/models/crm/organization/Organization';
import { logActivity } from '@/lib/logger';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('orgId');
        const year = searchParams.get('year');

        let filter = {};
        if (orgId) filter.organizationId = orgId;
        if (year) filter.year = parseInt(year);

        const runs = await PayrollRun.find(filter)
            .populate('organizationId', 'name')
            .populate('generatedBy', 'name')
            .sort({ year: -1, month: -1 });

        return NextResponse.json(runs);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { month, year, orgId, generatedBy } = body;

        if (!month || !year || !orgId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check for existing run
        const existingRun = await PayrollRun.findOne({ month, year, organizationId: orgId });
        if (existingRun) {
            return NextResponse.json({ error: `Payroll run for ${month}/${year} already exists.` }, { status: 400 });
        }

        const runId = `PRUN-${year}${String(month).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const run = await PayrollRun.create({
            runId,
            month,
            year,
            organizationId: orgId,
            generatedBy,
            status: 'Draft',
            periodStart: new Date(year, month - 1, 1),
            periodEnd: new Date(year, month, 0)
        });

        await logActivity({
            action: "initialized",
            entity: "PayrollRun",
            entityId: run.runId,
            description: `Initialized payroll run for ${month}/${year}`,
            performedBy: { userId: generatedBy },
            req: request
        });

        return NextResponse.json(run, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
