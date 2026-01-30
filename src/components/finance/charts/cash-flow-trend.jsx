"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function CashFlowTrendChart() {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Income",
                data: [5200000, 5800000, 5500000, 6100000, 5900000, 6500000],
                borderColor: "rgba(16, 185, 129, 1)", // Emerald
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "rgba(16, 185, 129, 1)",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: "Expenses",
                data: [4100000, 4300000, 4800000, 4500000, 5100000, 5000000],
                borderColor: "rgba(239, 68, 68, 1)", // Red
                backgroundColor: "rgba(239, 68, 68, 0.0)", // No fill for expenses to keep it clean, or subtle
                borderDash: [5, 5],
                tension: 0.4,
                fill: false,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "rgba(239, 68, 68, 1)",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                align: "end",
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: "600"
                    },
                    color: "#64748b"
                }
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                padding: 12,
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                cornerRadius: 8,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    font: { family: "'Inter', sans-serif", size: 11 },
                    color: "#94a3b8"
                }
            },
            y: {
                grid: {
                    color: "#f1f5f9",
                    drawBorder: false,
                    borderDash: [2, 2]
                },
                ticks: {
                    font: { family: "'Inter', sans-serif", size: 10 },
                    color: "#94a3b8",
                    callback: function (value) {
                        return '₹' + (value / 100000).toFixed(0) + 'L';
                    }
                },
                beginAtZero: false, // Better visualization of trends if we focus on the range
                suggestedMin: 3000000
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="h-64 w-full">
            <Line data={data} options={options} />
        </div>
    );
}
