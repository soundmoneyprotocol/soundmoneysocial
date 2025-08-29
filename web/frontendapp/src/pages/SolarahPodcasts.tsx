import { FunctionComponent } from "react";

const SolarahPodcasts: FunctionComponent = () => {
  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      {/* Background Circles */}
      <div className="absolute inset-0">
        {/* Large Circle */}
        <div 
          className="absolute w-[1340px] h-[1340px] rounded-full border border-gray-600"
          style={{
            left: '170px',
            top: '-594px',
            background: 'linear-gradient(126.07deg, #2a2a2a 0%, #666666 100%)'
          }}
        />
        
        {/* Medium Circle */}
        <div 
          className="absolute w-[1046px] h-[1046px] rounded-full border border-gray-600"
          style={{
            left: '317px',
            top: '-474px',
            background: 'linear-gradient(180deg, #000000 0%, #262626 100%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full">
        {/* Header Line */}
        <div className="w-full h-px bg-gray-600 absolute top-24" />
        
        <div className="flex items-center justify-between px-10 py-6">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {/* Logo Icon */}
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(-45deg, #FF00AA 0%, #CE2DD0 24.9%, #9C42F5 50.18%, #5D2DE1 100%)'
              }}
            >
              <div className="w-6 h-10 text-white relative">
                <svg viewBox="0 0 26 39" fill="currentColor" className="w-full h-full">
                  <path d="M13 0C5.8 0 0 5.8 0 13s5.8 13 13 13 13-5.8 13-13S20.2 0 13 0zm0 20c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
                  <path d="M13 26c-7.2 0-13 5.8-13 13h26c0-7.2-5.8-13-13-13z"/>
                </svg>
              </div>
            </div>
            
            {/* Logo Text */}
            <div className="flex items-center gap-6">
              <h1 
                className="text-white text-[30px] font-black uppercase tracking-wide"
                style={{ fontFamily: 'Arial Black, sans-serif' }}
              >
                $SOLARAH
              </h1>
              <span 
                className="text-[30px] font-semibold tracking-[-1px]"
                style={{ 
                  color: '#CE21CF',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                Podcasts
              </span>
            </div>
          </div>

          {/* Header Buttons */}
          <div className="flex items-center gap-4">
            {/* Record Button */}
            <button 
              className="px-6 py-3 rounded-full text-white font-medium text-xl tracking-[-0.2px] shadow-lg hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(-45deg, #FF00AA 0%, #CE2DD0 24.9%, #9C42F5 50.18%, #5D2DE1 100%)',
                boxShadow: '0 8px 8px -4px rgba(156, 66, 245, 0.4), 0 16px 24px rgba(156, 66, 245, 0.4), 0 2px 4px -1px rgba(12, 10, 82, 0.24), 0 0 1px rgba(156, 66, 245, 0.4)'
              }}
            >
              Record
            </button>
            
            {/* Help Button */}
            <button className="w-12 h-12 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                <path d="M9 16h2v-2H9v2zm1-16C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14C7.79 4 6 5.79 6 8h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
            Welcome to
            <br />
            <span 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
            >
              $SOLARAH
            </span>
            <br />
            Podcasts
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover exclusive content, behind-the-scenes stories, and connect with your favorite artists 
            through immersive podcast experiences.
          </p>
          
          <div className="flex items-center justify-center gap-6">
            <button 
              className="px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(-45deg, #FF00AA 0%, #CE2DD0 24.9%, #9C42F5 50.18%, #5D2DE1 100%)',
                boxShadow: '0 8px 8px -4px rgba(156, 66, 245, 0.4), 0 16px 24px rgba(156, 66, 245, 0.4), 0 2px 4px -1px rgba(12, 10, 82, 0.24)'
              }}
            >
              Start Listening
            </button>
            
            <button className="px-8 py-4 rounded-full text-white font-semibold text-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
              Browse Episodes
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <div className="relative z-10 pb-12">
        <div className="max-w-6xl mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Exclusive Content</h3>
              <p className="text-gray-400">Access premium episodes and behind-the-scenes content</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Artist Connections</h3>
              <p className="text-gray-400">Connect directly with your favorite creators and artists</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
              <p className="text-gray-400">Join a vibrant community of music and podcast lovers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarahPodcasts;