export default function CommunityPage() {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6">Join the Revolution</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our community is building the future of finance. Connect, collaborate, and grow with thousands of members worldwide.
          </p>
        </div>
  
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <a href="#" className="flex items-center p-8 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-2xl transition-all group">
                <div className="w-16 h-16 bg-[#5865F2] rounded-full flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    👾
                </div>
                <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Discord Server</h2>
                    <p className="text-gray-400">Join 50,000+ members. Live support, dev chatter, and community events.</p>
                </div>
            </a>
  
            <a href="#" className="flex items-center p-8 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-2xl transition-all group">
                <div className="w-16 h-16 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    🐦
                </div>
                <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Twitter / X</h2>
                    <p className="text-gray-400">Follow for the latest announcements, partnership news, and market insights.</p>
                </div>
            </a>
  
            <a href="#" className="flex items-center p-8 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 rounded-2xl transition-all group">
                <div className="w-16 h-16 bg-[#0088cc] rounded-full flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    ✈
                </div>
                <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Telegram</h2>
                    <p className="text-gray-400">Official announcement channel and community chat groups.</p>
                </div>
            </a>
  
            <a href="#" className="flex items-center p-8 bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border border-[#FF4500]/30 rounded-2xl transition-all group">
                <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform">
                    🤖
                </div>
                <div className="ml-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Reddit</h2>
                    <p className="text-gray-400">Deep dive discussions, memes, and long-form content.</p>
                </div>
            </a>
        </div>
      </div>
    );
  }
