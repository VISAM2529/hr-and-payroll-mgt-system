import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Announcement from "@/lib/db/models/communication/Announcement";
import { logActivity } from "@/lib/logger";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("organizationId");

        const filter = orgId ? { organizationId: orgId } : {};

        // Simple filter for now, can be expanded
        const announcements = await Announcement.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name'); // Assuming User model has name

        return NextResponse.json({ announcements });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const announcement = await Announcement.create(body);

        // Log activity
        if (body.createdBy) {
            await logActivity({
                action: "created",
                entity: "Announcement",
                entityId: announcement._id,
                description: `Posted announcement: ${body.title}`,
                performedBy: { userId: body.createdBy }, // Simplified
                req: request
            });
        }

        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
