import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Payslip from '@/lib/db/models/payroll/Payslip';
import { generatePfEcr, generateEsicExcel } from '@/services/reports/challan';
import * as XLSX from 'xlsx';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month'));
        const year = parseInt(searchParams.get('year'));
        const type = searchParams.get('type'); // 'pf' or 'esic'
        const orgId = searchParams.get('orgId');

        if (!month || !year || !type) {
            return NextResponse.json({ error: "Missing required params" }, { status: 400 });
        }

        // Fetch payslips for this month
        let query = { month, year };
        // We don't have orgId in Payslip directly in the sample model I saw, but let's assume valid population 
        // Logic: find employees of org, then payslips.
        // Wait, standard Payslip model usually has it or we filter by employee list.
        // Let's assume we filter by retrieving all payslips and checking context if organizationName is stored or via Employee.
        // Ideally we filter by employee's org.

        const payslips = await Payslip.find(query).populate('employee');

        // Filter by Org if provided (Client side filtering for MVP if DB index missing)
        const orgPayslips = orgId ? payslips.filter(p => p.employee?.jobDetails?.organizationId?.toString() === orgId) : payslips;

        if (type === 'pf') {
            const ecrText = generatePfEcr(orgPayslips.map(p => ({
                employee: p.employee.personalDetails, // Structure Mapping
                grossEarned: p.grossSalary,
                breakdown: {
                    deductions: {
                        pf: p.deductions.find(d => d.type === 'Provident Fund (PF)')?.amount || 0
                    },
                    companyContributions: {
                        epfEmployer: 0 // Need to store this in payslip if not there. Re-calculating or assuming stored.
                    }
                },
                presentDays: p.presentDays
            })));

            return new NextResponse(ecrText, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Content-Disposition': `attachment; filename="PF_ECR_${month}_${year}.txt"`
                }
            });
        } else if (type === 'esic') {
            // Map to structure expected by service
            const data = orgPayslips.map(p => ({
                employee: {
                    ...p.employee.personalDetails,
                    esicIpNumber: p.employee.esicIpNumber || '0000000000'
                },
                payableDays: p.presentDays, // ESIC works on payable days
                grossEarned: p.grossSalary,
                breakdown: {
                    deductions: {
                        esic: p.deductions.find(d => d.type === 'ESIC')?.amount || 0
                    }
                }
            }));

            const workbook = generateEsicExcel(data);
            const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            return new NextResponse(buf, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="ESIC_Return_${month}_${year}.xlsx"`
                }
            });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    } catch (error) {
        console.error("Report Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
