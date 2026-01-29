import FinanceDashboard from "@/components/finance/finance-dashboard";

export const metadata = {
    title: "Finance Hub | HRPayroll",
    description: "Financial overview and command center",
};

export default function FinancePage() {
    return (
        <div className="p-4 md:p-8">
            <FinanceDashboard initialTab="overview" />
        </div>
    );
}
