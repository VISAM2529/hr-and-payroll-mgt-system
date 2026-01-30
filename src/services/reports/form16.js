import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate Form 16 Part B PDF
 * @param {Object} employeeData 
 * @param {Object} taxData 
 */
export const generateForm16 = (employeeData, taxData) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('FORM NO. 16', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('[See rule 31(1)(a)]', 105, 20, { align: 'center' });
    doc.text('PART B', 105, 25, { align: 'center' });
    doc.text('Details of Salary Paid and any other income and tax deducted', 105, 30, { align: 'center' });

    // Employee Details
    autoTable(doc, {
        startY: 40,
        head: [['Field', 'Details']],
        body: [
            ['Employee Name', `${employeeData.firstName} ${employeeData.lastName}`],
            ['PAN', employeeData.panNumber],
            ['Assessment Year', '2025-26'],
            ['Period', '01-Apr-2024 to 31-Mar-2025']
        ]
    });

    // Salary Details
    doc.text('Details of Salary Paid:', 14, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Description', 'Amount (Rs.)']],
        body: [
            ['Gross Salary', taxData.annualGross.toFixed(2)],
            ['Less: Allowances Exempt u/s 10', taxData.exemptions.toFixed(2)],
            ['Less: Deductions u/s 16 (Standard Deduction)', taxData.stdDeduction.toFixed(2)],
            ['Income Chargeable under Head "Salaries"', taxData.taxableSalary.toFixed(2)],
            ['Less: Deductions under Chapter VI-A (80C, 80D)', taxData.chapterVIA.toFixed(2)],
            ['Total Taxable Income', taxData.netTaxableIncome.toFixed(2)],
            ['Tax on Total Income', taxData.taxOnIncome.toFixed(2)],
            ['Cess (4%)', taxData.cess.toFixed(2)],
            ['Total Tax Payable', taxData.totalTaxPayable.toFixed(2)]
        ]
    });

    // Footer
    doc.text('Place: Mumbai', 14, doc.lastAutoTable.finalY + 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, doc.lastAutoTable.finalY + 35);
    doc.text('Signature of Employer', 150, doc.lastAutoTable.finalY + 30);

    return doc; // Can be saved or returned as blob
};
