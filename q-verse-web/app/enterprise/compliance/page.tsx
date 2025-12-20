export default function CompliancePage() {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Enterprise Compliance Suite</h1>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="font-bold text-lg">Active Certifications</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                    {["SOC 2 Type II", "ISO 27001", "GDPR Compliant", "CCPA Ready"].map(cert => (
                        <div key={cert} className="flex items-center gap-3">
                            <div className="text-green-400">✓</div>
                            <span className="font-medium text-gray-300">{cert}</span>
                        </div>
                    ))}
                </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
                    <h3 className="font-bold mb-4">KYC / AML Portal</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Automated identity verification pipeline for onboarding users and institutions.
                        Real-time sanctions screening and transaction monitoring.
                    </p>
                    <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold">Configure Rules</button>
                </div>
                <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
                    <h3 className="font-bold mb-4">Audit Reports</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Generate real-time audit logs for all smart contract interactions and fund movements.
                        Exportable in PDF/CSV for regulatory reporting.
                    </p>
                    <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold">Generate Report</button>
                </div>
            </div>
        </div>
      </div>
    );
  }
