import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Folder, Settings, HelpCircle, Flag, DollarSign } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, to }) => {
    const location = useLocation();
    const isActive = to ? location.pathname === to : false;

    // Wrapper to handle both Link and div
    const content = (
        <div className={`flex items-center gap-5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}>
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
            <span className={`text-sm tracking-wide truncate ${isActive ? 'text-white' : 'text-white'}`}>{label}</span>
        </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed top-14 left-0 w-60 h-[calc(100vh-54px)] bg-[#0F0F0F] text-white overflow-y-auto px-3 py-2 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} custom-scrollbar`}>
                <div className="pb-4 border-b border-[#272727]">
                    <div onClick={() => window.innerWidth < 768 && toggleSidebar()}>
                        <SidebarItem icon={Home} label="Home" to="/" />
                        <SidebarItem icon={Compass} label="Shorts" to="/shorts" />
                        <SidebarItem icon={PlaySquare} label="Subscriptions" to="/subscriptions" />
                    </div>
                </div>

                <div className="py-4 border-b border-[#272727]">
                    <h3 className="px-3 mb-2 text-lg font-bold">You</h3>
                    <div onClick={() => window.innerWidth < 768 && toggleSidebar()}>
                        <SidebarItem icon={Folder} label="Library" to="/library" />
                        <SidebarItem icon={PlaySquare} label="Content" to="/studio/content" />
                        <SidebarItem icon={Clock} label="History" to="/history" />
                        <SidebarItem icon={Clock} label="Watch Later" to="/playlist/watch-later" />
                        <SidebarItem icon={ThumbsUp} label="Liked Videos" to="/playlist/liked" />
                        <SidebarItem icon={DollarSign} label="Monetization" to="/studio/monetization" />
                    </div>
                </div>



                <div className="py-4">
                    <SidebarItem icon={Settings} label="Settings" />
                    <SidebarItem icon={Flag} label="Report history" />
                    <SidebarItem icon={HelpCircle} label="Help" />
                </div>

                <div className="px-3 py-4 text-xs text-[#AAAAAA] font-semibold">
                    <p>About Press Copyright</p>
                    <p>Contact us Creators</p>
                    <p>Advertise Developers</p>
                    <div className="mt-2">
                        <p>© 2026 Google LLC</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
