import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import PayrollConfig from '@/lib/db/models/payroll/PayrollConfig';
import Organization from '@/lib/db/models/crm/organization/Organization';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('orgId');

        if (!orgId) {
            // Default to first organization's config if no orgId provided
            const firstOrg = await Organization.findOne();
            if (!firstOrg) return NextResponse.json({ error: "No organizations found" }, { status: 404 });

            let config = await PayrollConfig.findOne({ company: firstOrg._id });
            if (!config) {
                config = await PayrollConfig.create({ company: firstOrg._id });
            }
            return NextResponse.json(config);
        }

        let config = await PayrollConfig.findOne({ company: orgId });
        if (!config) {
            config = await PayrollConfig.create({ company: orgId });
        }
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { company } = body;

        let config = await PayrollConfig.findOneAndUpdate(
            { company },
            body,
            { new: true, upsert: true }
        );

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
