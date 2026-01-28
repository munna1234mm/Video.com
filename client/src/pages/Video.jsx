import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const Video = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const docRef = doc(db, "videos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setVideo({ id: docSnap.id, ...docSnap.data() });

                    // Increment View Count
                    // Use a flag in sessionStorage to prevent duplicate views on reload
                    const hasViewed = sessionStorage.getItem(`viewed_${id}`);
                    if (!hasViewed) {
                        await setDoc(docRef, { views: increment(1) }, { merge: true });
                        sessionStorage.setItem(`viewed_${id}`, 'true');
                    }
                } else {
                    console.log("No such video!");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-white" /></div>;
    if (!video) return <div className="text-white text-center mt-20">Video not found</div>;

    // Handle date display safely
    const formattedDate = video.uploadDate?.seconds
        ? new Date(video.uploadDate.seconds * 1000).toLocaleDateString()
        : (video.uploadDate ? new Date(video.uploadDate).toLocaleDateString() : 'Unknown date');

    return (
        <div className="flex flex-col lg:flex-row gap-6 px-4 py-6 w-full max-w-[1600px] mx-auto">
            {/* Main Content */}
            <div className="flex-1">
                {/* Video Player Placeholder - In a real app with 'Storage', use <video src={url} /> */}
                <div className="w-full max-h-[40vh] md:max-h-[72vh] aspect-video bg-black rounded-none md:rounded-xl overflow-hidden shadow-lg relative mx-auto">
                    {video.videoUrl && video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={video.videoUrl.replace('watch?v=', 'embed/')}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <video
                            ref={(el) => {
                                // Save ref and add keyboard listeners
                                if (el && !window.videoRefLocked) {
                                    window.videoRef = el;

                                    const handleKeyDown = (e) => {
                                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                                        switch (e.key.toLowerCase()) {
                                            case ' ':
                                            case 'k':
                                                e.preventDefault();
                                                el.paused ? el.play() : el.pause();
                                                break;
                                            case 'arrowleft':
                                                el.currentTime = Math.max(0, el.currentTime - 10);
                                                break;
                                            case 'arrowright':
                                                el.currentTime = Math.min(el.duration, el.currentTime + 10);
                                                break;
                                            case 'm':
                                                el.muted = !el.muted;
                                                break;
                                            case 'f':
                                                document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
                                                break;
                                        }
                                    };

                                    // Remove old listener if exists to prevent duplicates on re-render
                                    document.removeEventListener('keydown', window.videoKeyDownHandler);
                                    window.videoKeyDownHandler = handleKeyDown;
                                    document.addEventListener('keydown', handleKeyDown);
                                    window.videoRefLocked = true;
                                }
                            }}
                            src={video.videoUrl}
                            controls
                            className="w-full h-full focus:outline-none"
                            poster={video.thumbnailUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

                {/* Video Title */}
                <h1 className="text-xl font-bold text-white mt-4">{video.title}</h1>

                {/* Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 pb-4 border-b border-[#272727] gap-4">

                    {/* Channel Info */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden"
                            onClick={() => window.location.href = `/channel/${video.userId}`}
                        >
                            {/* Try to show channel avatar if we fetched it, otherwise fallback */}
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader}`} alt="Channel" />
                        </div>
                        <div className="cursor-pointer" onClick={() => window.location.href = `/channel/${video.userId}`}>
                            <h3 className="font-bold text-white">{video.uploader || 'Unknown Channel'}</h3>
                            <p className="text-xs text-[#AAAAAA]">1.2M subscribers</p>
                        </div>
                        <button
                            className="bg-white text-black px-4 py-2 rounded-full font-medium ml-4 hover:bg-gray-200 transition-colors"
                            onClick={() => alert("Subscribed! (Simulation)")}
                        >
                            Subscribe
                        </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <div className="flex items-center bg-[#272727] rounded-full overflow-hidden">
                            <button
                                className="flex items-center gap-2 px-4 py-2 hover:bg-[#3F3F3F] border-r border-[#3F3F3F]"
                                onClick={async () => {
                                    // Simple Like Logic: Increment in Firestore
                                    if (!video.id) return;
                                    try {
                                        const docRef = doc(db, "videos", video.id);
                                        await setDoc(docRef, { likes: (video.likes || 0) + 1 }, { merge: true });
                                        setVideo(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
                                    } catch (e) {
                                        console.error("Error liking video:", e);
                                        alert("Login required to like!");
                                    }
                                }}
                            >
                                <ThumbsUp className="w-5 h-5" /> {video.likes || 0}
                            </button>
                            <button className="px-4 py-2 hover:bg-[#3F3F3F]">
                                <ThumbsDown className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            className="flex items-center gap-2 bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3F3F3F]"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link copied to clipboard!");
                            }}
                        >
                            <Share2 className="w-5 h-5" /> Share
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-4 bg-[#272727] rounded-xl p-3 text-sm hover:bg-[#3F3F3F] cursor-pointer transition-colors block">
                    <div className="font-bold mb-1">{video.views || 0} views • {formattedDate}</div>
                    <p className="whitespace-pre-line text-gray-200">
                        {video.description || 'No description'}
                    </p>
                </div>

                {/* Comments Section (Simplified) */}
                <div className="mt-6">
                    <div className="flex items-center gap-8 mb-6">
                        <h3 className="text-xl font-bold">Comments</h3>
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-4 mb-6">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">U</div>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-[#3F3F3F] focus:border-white focus:outline-none pb-1 text-sm text-white placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Video;
