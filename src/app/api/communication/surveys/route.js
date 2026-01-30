import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Survey from "@/lib/db/models/communication/Survey";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("organizationId");

        const filter = orgId ? { organizationId: orgId } : {};

        const surveys = await Survey.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({ surveys });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const survey = await Survey.create(body);

        return NextResponse.json(survey, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
