import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle } from 'lucide-react';

const VideoCard = ({ video }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Helper to format date safely
    const formatTimeAgo = (dateInput) => {
        if (!dateInput) return 'Just now';

        let date;
        // Handle Firestore Timestamp (seconds, nanoseconds)
        if (dateInput?.seconds) {
            date = new Date(dateInput.seconds * 1000);
        } else if (dateInput instanceof Date) {
            date = dateInput;
        } else {
            return 'Just now'; // Fallback
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
        return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    };

    const handleMenuAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(false);

        if (action === 'share' || action === 'copy') {
            const url = `${window.location.origin}/video/${video.id}`;
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="relative">
            <Link to={`/video/${video.id}`} className="block">
                <div
                    className="flex flex-col gap-3 cursor-pointer group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Thumbnail Container */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#202020]">
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : ''}`}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-[10px] md:text-xs px-1.5 py-0.5 rounded font-medium">
                            {video.duration || '00:00'}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 md:w-9 md:h-9 min-w-[32px] md:min-w-[36px] rounded-full overflow-hidden bg-gray-600">
                            {/* Avatar Placeholder */}
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader}`} alt={video.uploader} />
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-start gap-1">
                                <h3 className="text-white font-semibold text-xs md:text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                    {video.title}
                                </h3>
                                {/* Three Dot Menu Toggle */}
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                    className={`shrink-0 p-1 hover:bg-[#272727] rounded-full transition-all ${isMenuOpen ? 'bg-[#272727]' : 'md:opacity-0 group-hover:opacity-100'}`}
                                >
                                    <MoreVertical className="text-white w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                            </div>
                            <div className="text-[#AAAAAA] text-[10px] md:text-xs mt-1 flex items-center gap-1">
                                <Link to={`/channel/${video.userId}`} className="hover:text-white transition-colors truncate">
                                    {video.uploader}
                                </Link>
                                <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 fill-[#AAAAAA] text-black" />
                            </div>
                            <div className="text-[#AAAAAA] text-[10px] md:text-xs">
                                {video.views} views • {formatTimeAgo(video.uploadDate)}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 md:w-40 bg-[#272727] border border-[#3F3F3F] rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                    <button
                        onClick={(e) => handleMenuAction(e, 'share')}
                        className="w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-white hover:bg-[#3F3F3F] transition-colors"
                    >
                        Share
                    </button>
                    <button
                        onClick={(e) => handleMenuAction(e, 'copy')}
                        className="w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-white hover:bg-[#3F3F3F] transition-colors"
                    >
                        Copy Link
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoCard;
