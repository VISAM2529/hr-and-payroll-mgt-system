import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import OfferLetter from '@/lib/db/models/recruitment/OfferLetter';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const candidateId = searchParams.get('candidateId');

        let query = {};
        if (candidateId) query.candidate = candidateId;

        const offers = await OfferLetter.find(query).populate('candidate', 'name email');
        return NextResponse.json({ offers });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const offer = await OfferLetter.create(body);
        return NextResponse.json({ offer, message: "Offer letter generated successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;

        const offer = await OfferLetter.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ offer, message: "Offer status updated" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
