
import React from 'react';

interface PrintableReportProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    showFooter?: boolean;
}

const PrintableReport: React.FC<PrintableReportProps> = ({
    title,
    subtitle,
    children,
    showFooter = true
}) => {
    const currentDate = new Date();

    return (
        <div className="hidden print-container font-sans text-black bg-white">
            {/* Clean Professional Header */}
            <header className="border-b-2 border-gray-900 pb-4 mb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">JUBEL HAVILAH ENTERPRISE</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Inventory Management System</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        <p>Kasoa, Nyanyano Road, Fijai</p>
                        <p>Tel: 0302944074 / 0246536878</p>
                        <p>jubelsbusiness@gmail.com</p>
                    </div>
                </div>
            </header>

            {/* Document Title */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                    </div>
                    <div className="text-right text-sm">
                        <p className="text-gray-500">Report Date</p>
                        <p className="font-semibold text-gray-900">
                            {currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-gray-600">
                            {currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="h-0.5 bg-gray-200 mt-4"></div>
            </div>

            {/* Main Content */}
            <main className="mb-8">
                {children}
            </main>

            {/* Clean Footer */}
            {showFooter && (
                <footer className="border-t-2 border-gray-900 pt-4 mt-8">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <div>
                            <span className="font-semibold text-gray-700">JUBEL HAVILAH ENTERPRISE</span>
                            <span className="mx-2">|</span>
                            <span>Kasoa, Nyanyano Road, Fijai - Opposite The Court</span>
                        </div>
                        <div>
                            Generated: {currentDate.toLocaleString('en-GB')}
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        © {currentDate.getFullYear()} JUBEL HAVILAH ENTERPRISE. All rights reserved.
                    </p>
                </footer>
            )}
        </div>
    );
};

export default PrintableReport;
