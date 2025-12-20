export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 mt-20 py-12 bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
              Q
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Q-Verse
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            The world's first Quantum-Safe Hybrid Finance Network. Bridging
            traditional finance with the security of post-quantum cryptography.
          </p>
          <div className="flex gap-4">
            {/* Social Icons */}
            {["𝕏", "M", "✈", "Discord"].map((icon, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 cursor-pointer transition-all"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
            Ecosystem
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/ecosystem" className="hover:text-blue-400 transition-colors">
                Overview
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                USDT-gVerse Integration
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                QVR Token
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                POPEO Stablecoin
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
            Developers
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/developers" className="hover:text-blue-400 transition-colors">
                Documentation
              </a>
            </li>
            <li>
              <a href="https://github.com" className="hover:text-blue-400 transition-colors">
                GitHub
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Audit Reports
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Bug Bounty
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
            Governance
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/governance" className="hover:text-blue-400 transition-colors">
                DAO Proposal
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Voting Power
              </a>
            </li>
            <li>
              <a href="/community" className="hover:text-blue-400 transition-colors">
                Forum
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800/50 mt-12 pt-8 text-center text-gray-600 text-sm">
        © 2025 Q-Verse Foundation. All rights reserved.
      </div>
    </footer>
  );
}
