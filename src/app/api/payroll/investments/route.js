import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import InvestmentDeclaration from '@/lib/db/models/payroll/InvestmentDeclaration';
import { logActivity } from '@/lib/logger';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const financialYear = searchParams.get('financialYear') || "2025-26";

        if (!employeeId) {
            // Admin view: Fetch all declarations for the FY
            const declarations = await InvestmentDeclaration.find({ financialYear })
                .populate('employeeId', 'personalDetails.firstName personalDetails.lastName employeeId');
            return NextResponse.json(declarations);
        }

        let declaration = await InvestmentDeclaration.findOne({ employeeId, financialYear });

        if (!declaration) {
            // Create a default empty declaration if not found
            declaration = {
                employeeId,
                financialYear,
                status: 'Draft',
                sections: {
                    section80C: { ppf: 0, elss: 0, lic: 0, nsc: 0, others: 0, total: 0 },
                    section80D: { mediclaimSelf: 0, mediclaimParents: 0, total: 0 },
                    hra: { annualRent: 0, landlordPan: '', city: 'Non-Metro' },
                    otherDeductions: { standardDeduction: 50000, professionalTax: 0, others: 0 }
                }
            };
        }

        return NextResponse.json(declaration);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { employeeId, financialYear, sections, actualSubmissions, status, remark } = body;

        if (!employeeId || !financialYear) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Calculate totals for 80C and 80D
        if (sections) {
            if (sections.section80C) {
                const s = sections.section80C;
                sections.section80C.total = (s.ppf || 0) + (s.elss || 0) + (s.lic || 0) + (s.nsc || 0) + (s.others || 0);
            }
            if (sections.section80D) {
                const s = sections.section80D;
                sections.section80D.total = (s.mediclaimSelf || 0) + (s.mediclaimParents || 0);
            }
        }

        const updateData = {
            employeeId,
            financialYear,
            status: body.submit ? 'Pending' : (status || 'Draft')
        };

        if (sections) updateData.sections = sections;
        if (actualSubmissions) updateData.actualSubmissions = actualSubmissions;
        if (remark) updateData.remark = remark;

        const declaration = await InvestmentDeclaration.findOneAndUpdate(
            { employeeId, financialYear },
            updateData,
            { upsert: true, new: true }
        );

        await logActivity({
            action: body.submit ? "submitted" : "saved_draft",
            entity: "InvestmentDeclaration",
            entityId: declaration._id,
            description: `${body.submit ? 'Submitted' : 'Saved draft'} investment declaration for FY ${financialYear}`,
            performedBy: { userId: employeeId },
            req: request
        });

        return NextResponse.json(declaration, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
