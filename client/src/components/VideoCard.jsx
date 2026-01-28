import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, CheckCircle } from 'lucide-react';

const VideoCard = ({ video }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
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
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {video.duration}
                    </div>
                </div>

                {/* Info */}
                <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 min-w-[36px] rounded-full overflow-hidden bg-gray-600">
                        {/* Avatar Placeholder */}
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader}`} alt={video.uploader} />
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex justify-between items-start">
                            <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                {video.title}
                            </h3>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#272727] rounded-full">
                                <MoreVertical className="text-white w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-[#AAAAAA] text-sm mt-1 flex items-center gap-1">
                            <span>{video.uploader}</span>
                            <CheckCircle className="w-3 h-3 fill-[#AAAAAA] text-black" />
                        </div>
                        <div className="text-[#AAAAAA] text-sm">
                            {video.views} views • {video.uploadDate}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;
