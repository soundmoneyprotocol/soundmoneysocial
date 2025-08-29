import { FunctionComponent } from "react";

const Dashboard: FunctionComponent = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-black uppercase mb-4" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-xl text-gray-300" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Social Tokens on SoundMoney
          </p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Social Tokens Card */}
          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">563</div>
              <div className="text-gray-400 text-lg">Social Tokens</div>
            </div>
          </div>

          {/* Market Cap Card */}
          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">$26M</div>
              <div className="text-gray-400 text-lg mb-4">Market Cap</div>
              {/* Green trend chart placeholder */}
              <div className="flex items-center justify-center">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                  <path
                    d="M2 35 L20 28 L40 30 L60 20 L80 15 L100 8 L118 5"
                    stroke="#22c55e"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="118" cy="5" r="3" fill="#22c55e" />
                </svg>
              </div>
            </div>
          </div>

          {/* Trade Volume Card */}
          <div className="bg-gray-900/30 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">$12K</div>
              <div className="text-gray-400 text-lg mb-4">Trade Volume</div>
              {/* Red trend chart placeholder */}
              <div className="flex items-center justify-center">
                <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
                  <path
                    d="M2 8 L20 15 L40 12 L60 22 L80 28 L100 32 L118 35"
                    stroke="#ef4444"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="118" cy="35" r="3" fill="#ef4444" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Podcast Player Card */}
        <div className="bg-gray-900/30 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Podcast Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4">
                Ep. 60: Eva Marcille Discusses Career Evolution and Motherhood
              </h2>
              <div className="flex items-center gap-6 mb-6">
                <button 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  style={{
                    background: 'linear-gradient(-45deg, #FF00AA 0%, #CE2DD0 24.9%, #9C42F5 50.18%, #5D2DE1 100%)'
                  }}
                >
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
                    <path d="M0 0v24l20-12L0 0z" />
                  </svg>
                </button>
                <div className="text-gray-400">
                  <div className="text-sm">Episode 60</div>
                  <div className="text-sm">45:23 duration</div>
                </div>
              </div>
              
              {/* Waveform Visualization */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 60 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm"
                    style={{
                      width: '4px',
                      height: `${Math.random() * 40 + 10}px`,
                      opacity: i < 20 ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="h-2 rounded-full"
                  style={{
                    width: '33%',
                    background: 'linear-gradient(-45deg, #FF00AA 0%, #CE2DD0 24.9%, #9C42F5 50.18%, #5D2DE1 100%)'
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>15:12</span>
                <span>45:23</span>
              </div>
            </div>

            {/* Episode Artwork */}
            <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <div className="text-white text-center">
                <div className="text-2xl font-bold mb-2">EP 60</div>
                <div className="text-sm">Eva Marcille</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;