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
            <div className="flex items-center gap-1 md:gap-4">
                <Link to="/upload" className="block p-2 hover:bg-[#272727] rounded-full transition-colors">
                    <Video className="text-white w-5 h-5 md:w-6 md:h-6" />
                </Link>
                <button className="hidden sm:block p-2 hover:bg-[#272727] rounded-full transition-colors relative">
                    <Bell className="text-white w-6 h-6" />
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">9+</span>
                </button>

                {/* User Auth Info */}
                {currentUser ? (
                    <div className="flex items-center gap-1 md:gap-3">
                        <Link to={`/channel/${currentUser.uid}`}>
                            <img
                                src={currentUser.photoURL}
                                alt={currentUser.displayName}
                                className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-[#272727] cursor-pointer"
                                title={currentUser.displayName}
                            />
                        </Link>
                        <Link
                            to={`/channel/${currentUser.uid}`}
                            className="hidden md:block text-sm font-medium text-white hover:bg-[#272727] px-3 py-1.5 rounded-full border border-[#303030] whitespace-nowrap"
                        >
                            Channel
                        </Link>
                        <button
                            onClick={logout}
                            className="text-[10px] md:text-sm font-medium text-red-400 hover:bg-[#272727] p-2 md:px-3 md:py-1.5 rounded-full border border-transparent md:border-[#303030] flex items-center justify-center"
                            title="Exit"
                        >
                            <span className="hidden md:inline">Exit</span>
                            <span className="md:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            </span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={loginWithGoogle}
                        className="flex items-center gap-1 md:gap-2 text-[#3ea6ff] border border-[#3ea6ff] px-3 md:px-4 py-1 md:py-1.5 rounded-full font-medium hover:bg-[#263850] transition-colors text-xs md:text-base"
                    >
                        <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
