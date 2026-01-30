import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Expense from '@/lib/db/models/finance/Expense';
import { z } from 'zod';

const expenseSchema = z.object({
    employee: z.string(),
    title: z.string().min(1),
    category: z.enum(['Travel', 'Food', 'Accommodation', 'Equipment', 'Software', 'Utilities', 'Other']),
    amount: z.number().min(0),
    date: z.string().transform(val => new Date(val)),
    description: z.string().optional(),
    receiptUrl: z.string().optional(),
    costCenter: z.string().optional(),
    gstDetails: z.object({
        gstNumber: z.string().optional(),
        gstAmount: z.number().optional(),
        isGstIncluded: z.boolean().default(true)
    }).optional()
});

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');

        let query = {};
        if (employeeId) query.employee = employeeId;
        if (status) query.status = status;

        // Search Logic
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Date Filtering
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query)
            .populate('employee', 'personalDetails employeeId')
            .populate('costCenter', 'name code')
            .sort({ createdAt: -1 });

        return NextResponse.json({ expenses });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const validatedData = expenseSchema.parse(body);

        const expense = await Expense.create(validatedData);
        return NextResponse.json({ expense, message: "Expense claim submitted successfully" }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });

        const expense = await Expense.findByIdAndUpdate(id, updateData, { new: true });

        // If status becomes 'Paid', we could potentially trigger a Journal Entry here
        // But for now, just update the status

        return NextResponse.json({ expense, message: "Expense updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
