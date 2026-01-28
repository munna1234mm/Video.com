import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Flame, Folder, Gamepad2, Trophy, Settings, HelpCircle, Flag } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive }) => (
    <div className={`flex items-center gap-5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
        <span className={`text-sm tracking-wide truncate ${isActive ? 'text-white' : 'text-white'}`}>{label}</span>
    </div>
);

const Sidebar = ({ isOpen }) => {
    if (!isOpen) return null; // Or return a mini-sidebar

    return (
        <div className="fixed top-14 left-0 w-60 h-[calc(100vh-56px)] bg-[#0F0F0F] text-white overflow-y-auto px-3 py-2 z-40 custom-scrollbar hidden md:block">
            <div className="pb-4 border-b border-[#272727]">
                <SidebarItem icon={Home} label="Home" isActive />
                <SidebarItem icon={Compass} label="Shorts" />
                <SidebarItem icon={PlaySquare} label="Subscriptions" />
            </div>

            <div className="py-4 border-b border-[#272727]">
                <h3 className="px-3 mb-2 text-lg font-bold">You</h3>
                <SidebarItem icon={Folder} label="Library" />
                <SidebarItem icon={Clock} label="History" />
                <SidebarItem icon={Clock} label="Watch Later" />
                <SidebarItem icon={ThumbsUp} label="Liked Videos" />
            </div>

            <div className="py-4 border-b border-[#272727]">
                <h3 className="px-3 mb-2 text-lg font-bold">Explore</h3>
                <SidebarItem icon={Flame} label="Trending" />
                <SidebarItem icon={Gamepad2} label="Gaming" />
                <SidebarItem icon={Trophy} label="Sports" />
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
    );
};

export default Sidebar;
