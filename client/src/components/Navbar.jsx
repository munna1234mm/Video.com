import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Video, Bell, Mic, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser, loginWithGoogle, logout } = useAuth();

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    const handleAuth = async () => {
        if (currentUser) {
            await logout();
        } else {
            await loginWithGoogle();
        }
    };

    return (
        <nav className="fixed top-0 z-50 w-full bg-[#0F0F0F] border-b border-[#272727] h-14 flex items-center px-4 justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-[#272727] rounded-full transition-colors"
                >
                    <Menu className="text-white w-6 h-6" />
                </button>
                <div className="flex items-center gap-1 cursor-pointer">
                    <div className="bg-red-600 p-1 rounded-lg">
                        <Video className="text-white w-4 h-4 fill-white" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tighter">YouTube <span className="text-xs font-normal text-gray-400">Lite</span></span>
                </div>
            </div>

            {/* Center - Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-[600px] ml-12">
                <div className="flex w-full">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 text-white focus:outline-none focus:border-blue-500 placeholder-gray-500 shadow-inner"
                    />
                    <button type="submit" className="bg-[#222222] border border-l-0 border-[#303030] px-5 py-2 rounded-r-full hover:bg-[#303030] transition-colors">
                        <Search className="text-white w-5 h-5" />
                    </button>
                </div>
                <button type="button" className="ml-4 p-2 bg-[#181818] hover:bg-[#303030] rounded-full transition-colors">
                    <Mic className="text-white w-5 h-5" />
                </button>
            </form>

            {/* Right */}
            <div className="flex items-center gap-2 md:gap-4">
                <Link to="/upload" className="hidden md:block p-2 hover:bg-[#272727] rounded-full transition-colors">
                    <Video className="text-white w-6 h-6" />
                </Link>
                <button className="hidden md:block p-2 hover:bg-[#272727] rounded-full transition-colors relative">
                    <Bell className="text-white w-6 h-6" />
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">9+</span>
                </button>

                {/* User Auth Info */}
                {currentUser ? (
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName}
                            className="w-8 h-8 rounded-full border border-[#272727]"
                            title={currentUser.displayName}
                        />
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-white hover:bg-[#272727] px-3 py-1 rounded-full border border-[#303030]"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={loginWithGoogle}
                        className="flex items-center gap-2 text-[#3ea6ff] border border-[#3ea6ff] px-4 py-1.5 rounded-full font-medium hover:bg-[#263850] transition-colors"
                    >
                        <UserCircle className="w-5 h-5" />
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
