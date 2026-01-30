import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import PayrollRun from '@/lib/db/models/payroll/PayrollRun';
import Employee from '@/lib/db/models/payroll/Employee'; // Added import
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

        // Count eligible employees
        // Need to import Employee model first at top of file if not present
        // But since this is a route.js, we can do dynamic import or assume it's imported (it wasn't imported in view_file output)
        // Let's check imports first.
        // Wait, line 5 in original file view was empty import list? No, line 3 was PayrollRun. 
        // I need to add Employee import at top.

        // This tool call handles the logic insertion. I will need another one to add the import.

        const totalEmployees = await Employee.countDocuments({
            'jobDetails.organizationId': orgId,
            status: 'Active'
        });

        const run = await PayrollRun.create({
            runId,
            month,
            year,
            organizationId: orgId,
            generatedBy,
            status: 'Draft',
            totalEmployees: totalEmployees, // Set initial count
            periodStart: new Date(year, month - 1, 1),
            periodEnd: new Date(year, month, 0)
        });

        await logActivity({
            action: "initialized",
            entity: "PayrollRun",
            entityId: run.runId,
            description: `Initialized payroll run for ${month}/${year} with ${totalEmployees} employees`,
            performedBy: { userId: generatedBy },
            req: request
        });

        return NextResponse.json(run, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
