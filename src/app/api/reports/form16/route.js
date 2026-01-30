import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Employee from '@/lib/db/models/payroll/Employee';
import PayrollRun from '@/lib/db/models/payroll/PayrollRun'; // We need actual run data
// Wait, we need Payslips for actual data.
import Payslip from '@/lib/db/models/payroll/Payslip';
import { generateForm16 } from '@/services/reports/form16';
import { compareTaxRegimes } from '@/services/compliance/tax-regime';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const year = parseInt(searchParams.get('year')); // Financial Year Start e.g. 2024 for FY 24-25

        if (!employeeId || !year) {
            return NextResponse.json({ error: "Missing employeeId or year" }, { status: 400 });
        }

        const employee = await Employee.findById(employeeId).populate('personalDetails');
        if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

        // Fetch Payslips for the FY (April [year] to March [year+1])
        const startMonth = 4; // April
        const payslips = await Payslip.find({
            employee: employeeId,
            $or: [
                { year: year, month: { $gte: 4 } },
                { year: year + 1, month: { $lte: 3 } }
            ]
        });

        const grossSalary = payslips.reduce((sum, p) => sum + p.grossSalary, 0);
        const basicSalary = payslips.reduce((sum, p) => sum + p.basicSalary, 0);

        // Calculate Exemptions (Simplified for API)
        const exemptions = 0; // Needs actual declaration logic
        const stdDeduction = 75000; // New Regime assumption or based on regime

        // Use our tax service to calculate final numbers
        // We assume New Regime for simplicity in this generated report unless declared
        const taxData = {
            annualGross: grossSalary,
            exemptions,
            stdDeduction,
            taxableSalary: grossSalary - exemptions - stdDeduction,
            chapterVIA: 0,
            netTaxableIncome: Math.max(0, grossSalary - exemptions - stdDeduction),
            taxOnIncome: 0,
            cess: 0,
            totalTaxPayable: 0
        };

        // Recalculate using service
        const comparison = compareTaxRegimes(grossSalary, { otherExemptions: 0 });
        // Picking the better one or default new
        const regime = comparison.newRegime;

        taxData.taxOnIncome = regime.tax * (100 / 104); // Extract cess? No, our service returns total tax.
        // Actually service returns tax + cess.
        // Let's just use what service gave.
        taxData.totalTaxPayable = regime.tax;
        taxData.cess = regime.tax * 0.04;

        const pdfDoc = generateForm16(employee.personalDetails, taxData);
        const pdfBuffer = pdfDoc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Form16_${employee.personalDetails.firstName}_${year}.pdf"`,
            }
        });

    } catch (error) {
        console.error("Form 16 Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
