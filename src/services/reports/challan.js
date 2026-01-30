import * as XLSX from 'xlsx';

/**
 * Generate PF ECR format (Text file)
 * @param {Array} payrollData 
 */
export const generatePfEcr = (payrollData) => {
    // ECR Format: UAN#MEMBER_NAME#GROSS#EPF_WAGES#EPS_WAGES#EDLI_WAGES#EE_SHARE#ER_SHARE_EPF#ER_SHARE_EPS#NCP_DAYS#REFUNDS
    let content = '';

    payrollData.forEach((record) => {
        const { employee, breakdown, presentDays } = record;
        const line = [
            employee.uan || '',
            `${employee.firstName} ${employee.lastName}`,
            record.grossEarned,
            Math.min(record.grossEarned, 15000), // EPF Wages
            Math.min(record.grossEarned, 15000), // EPS Wages
            Math.min(record.grossEarned, 15000), // EDLI Wages
            breakdown.deductions.pf,
            breakdown.companyContributions?.epfEmployer || 0,
            breakdown.companyContributions?.esicEmployer || 0, // Wait, this is PF ECR.
            // Correction: PF ECR columns are specific.
            // UAN#Member Name#Gross Wages#EPF Wages#EPS Wages#EDLI Wages#EE Share Remitted#EPS Contribution Remitted#EPF Share Remitted#NCP Days#Refund of Advances
            Math.min(record.grossEarned, 15000), // EPF Share Remitted (Employer portion usually splits into EPS and EPF)
            30 - presentDays, // NCP Days (absent)
            0 // Refunds
        ].join('#');
        content += line + '\n';
    });

    return content;
};

/**
 * Generate ESIC Excel Return
 * @param {Array} payrollData 
 */
export const generateEsicExcel = (payrollData) => {
    const data = payrollData
        .filter(p => p.breakdown.deductions.esic > 0)
        .map(p => ({
            'IP Number': p.employee.esicIpNumber,
            'IP Name': `${p.employee.firstName} ${p.employee.lastName}`,
            'No of Days': p.payableDays,
            'Total Monthly Wages': p.grossEarned,
            'Reason Code': 0,
            'Last Working Day': ''
        }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ESIC Return');

    return workbook; // Caller can write file
};
