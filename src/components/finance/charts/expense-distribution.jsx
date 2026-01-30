"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseDistributionChart() {
    const data = {
        labels: ["Payroll", "Office Supplies", "Software", "Marketing", "Travel", "Utilities"],
        datasets: [
            {
                label: "Expenses",
                data: [4250000, 150000, 320000, 180000, 120000, 85000],
                backgroundColor: [
                    "rgba(99, 102, 241, 0.8)",   // Indigo
                    "rgba(16, 185, 129, 0.8)",   // Emerald
                    "rgba(249, 115, 22, 0.8)",   // Orange
                    "rgba(236, 72, 153, 0.8)",   // Pink
                    "rgba(14, 165, 233, 0.8)",   // Sky
                    "rgba(100, 116, 139, 0.8)",  // Slate
                ],
                borderColor: [
                    "rgba(99, 102, 241, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(249, 115, 22, 1)",
                    "rgba(236, 72, 153, 1)",
                    "rgba(14, 165, 233, 1)",
                    "rgba(100, 116, 139, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    usePointStyle: true,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: "600"
                    },
                    padding: 20,
                    color: "#64748b" // slate-500
                }
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900
                padding: 12,
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        cutout: "70%",
    };

    return (
        <div className="h-64 w-full relative">
            <Doughnut data={data} options={options} />
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total</span>
                <span className="text-xl font-black text-slate-900">₹51.0L</span>
            </div>
        </div>
    );
}
