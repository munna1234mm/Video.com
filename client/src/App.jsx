import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Video from './pages/Video';
import Upload from './pages/Upload';
import Channel from './pages/Channel';
import { AuthProvider } from './context/AuthContext';

import ChannelCustomization from './pages/ChannelCustomization';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0F0F0F] text-white">
          <Navbar toggleSidebar={toggleSidebar} />

          <div className="flex pt-14">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/video/:id" element={<Video />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/channel/:uid" element={<Channel />} />
                <Route path="/studio/customization" element={<ChannelCustomization />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
