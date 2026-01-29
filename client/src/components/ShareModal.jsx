import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const ShareModal = ({ isOpen, onClose, videoUrl, title }) => {
    const { addToast } = useToast();
    const [withTimestamp, setWithTimestamp] = useState(false);
    const [timestamp, setTimestamp] = useState("0:00"); // Default, could be calculated from current time if passed

    if (!isOpen) return null;

    const handleCopyLink = () => {
        let url = videoUrl || window.location.href;
        if (withTimestamp) {
            // Convert MM:SS to seconds for ?t= parameter if needed, 
            // but for now let's just append as demonstration or use basic logic
            // Simple parsing assumption: "0:42" -> 42s
            const parts = timestamp.split(':').map(Number);
            let timeSec = 0;
            if (parts.length === 2) timeSec = parts[0] * 60 + parts[1];
            else if (parts.length === 3) timeSec = parts[0] * 3600 + parts[1] * 60 + parts[2];

            if (url.includes('?')) url += `&t=${timeSec}`;
            else url += `?t=${timeSec}`;
        }

        navigator.clipboard.writeText(url);
        addToast("Link copied to clipboard!", "success");
    };

    const socialApps = [
        { name: 'WhatsApp', icon: 'chat', color: 'bg-[#25D366]' },
        { name: 'Facebook', icon: 'public', color: 'bg-[#1877F2]' },
        { name: 'X / Twitter', icon: 'alternate_email', color: 'bg-[#000000]' },
        { name: 'Reddit', icon: 'forum', color: 'bg-[#FF4500]' },
        { name: 'Email', icon: 'mail', color: 'bg-[#EA4335]' },
        { name: 'Telegram', icon: 'send', color: 'bg-[#229ED9]' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            {/* Modal Container */}
            <div className="w-full max-w-[520px] bg-[#193322] border border-[#326744] rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#326744]">
                    <h3 className="text-white text-xl font-bold leading-tight tracking-tight">Share</h3>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-full w-10 h-10 hover:bg-[#23482f] transition-colors text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Social Icons */}
                    <div className="relative">
                        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                            {socialApps.map((app) => (
                                <div key={app.name} className="flex flex-col items-center gap-2 group cursor-pointer min-w-[72px]" onClick={() => addToast(`Sharing to ${app.name}...`)}>
                                    <div className="w-14 h-14 rounded-full bg-[#23482f] flex items-center justify-center group-hover:bg-[#326744] transition-all">
                                        <span className="material-symbols-outlined text-white text-2xl">{app.icon}</span>
                                    </div>
                                    <span className="text-xs text-[#92c9a4] font-medium">{app.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Copy Link Section */}
                    <div className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium leading-normal px-1">Video Link</p>
                        <div className="flex items-stretch gap-0 w-full group">
                            <div className="relative flex-1">
                                <input
                                    className="w-full rounded-lg rounded-r-none border border-[#326744] bg-[#112217] text-white focus:outline-0 focus:ring-1 focus:ring-[#13ec5b] h-12 px-4 text-sm font-normal truncate"
                                    readOnly
                                    value={videoUrl || "https://youtu.be/..."}
                                />
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="flex min-w-[80px] cursor-pointer items-center justify-center overflow-hidden rounded-r-lg h-12 px-5 bg-[#13ec5b] text-[#112217] text-sm font-bold hover:bg-[#11d652] active:scale-95 transition-all"
                            >
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>

                    {/* Timestamp Toggle */}
                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={withTimestamp}
                                onChange={(e) => setWithTimestamp(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-[#23482f] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13ec5b]"></div>
                        </label>
                        <span className="text-sm text-white font-medium">Start at</span>
                        <input
                            className="w-16 h-8 bg-[#112217] border border-[#326744] rounded text-xs text-center text-white focus:ring-1 focus:ring-[#13ec5b] focus:outline-none"
                            type="text"
                            value={timestamp}
                            onChange={(e) => setTimestamp(e.target.value)}
                            disabled={!withTimestamp}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[#112217]/50 border-t border-[#326744] flex justify-end">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-lg h-10 px-6 bg-[#23482f] text-white text-sm font-bold hover:bg-[#326744] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
