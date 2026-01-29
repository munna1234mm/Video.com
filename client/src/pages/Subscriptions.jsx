import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Grid, List as ListIcon, Filter } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { Link } from 'react-router-dom';

const Subscriptions = () => {
    const { currentUser } = useAuth();
    const [videos, setVideos] = useState([]);
    const [subscribedChannels, setSubscribedChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        if (!currentUser || !db) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch User's Subscriptions
                // Assuming we stored subs in users/{uid}/subscriptions/{subId}
                const subsRef = collection(db, "users", currentUser.uid, "subscriptions");
                const subsSnap = await getDocs(subsRef);

                const subsData = subsSnap.docs.map(doc => ({
                    id: doc.id, // This is usually the channel/user UID
                    ...doc.data()
                }));
                setSubscribedChannels(subsData);

                if (subsData.length === 0) {
                    setVideos([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Videos from these channels
                // Firestore 'in' query supports up to 10 items. If user has >10 subs, we need multiple queries or client-side filtering.
                // For simplicity/demo: Fetch all videos and filter client side (not scalable but works for small app)
                // BETTER: Fetch latest from each sub.

                // Let's try to query videos where userId is in subsData.map(s => s.uid)
                // Extract User IDs
                const channelIds = subsData.map(sub => sub.channelId); // Ensure we saved channelId in subscription doc

                // Chunking for 'in' query limit (10)
                let allVideos = [];
                const chunks = [];
                for (let i = 0; i < channelIds.length; i += 10) {
                    chunks.push(channelIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const videoQ = query(
                        collection(db, "videos"),
                        where("userId", "in", chunk),
                        orderBy("uploadDate", "desc"),
                        limit(20) // Limit per chunk to avoid overload
                    );
                    const videoSnap = await getDocs(videoQ);
                    const chunkVideos = videoSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    allVideos = [...allVideos, ...chunkVideos];
                }

                // Sort merged results by date desc
                allVideos.sort((a, b) => {
                    const dateA = a.uploadDate?.seconds || 0;
                    const dateB = b.uploadDate?.seconds || 0;
                    return dateB - dateA;
                });

                setVideos(allVideos);

            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (loading) return (
        <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
    );

    if (!currentUser) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <h2 className="text-xl font-bold mb-2">Don't miss new videos</h2>
            <p className="text-gray-400 mb-6">Sign in to see updates from your favorite YouTube channels</p>
        </div>
    );

    return (
        <div className="flex flex-col bg-[#0F0F0F] min-h-screen text-white">

            {/* Story Carousel / Subscribed Channels */}
            <div className="sticky top-0 z-10 bg-[#0F0F0F]/95 backdrop-blur-sm border-b border-[#272727]">
                <div className="flex items-center overflow-x-auto px-6 py-4 gap-6 no-scrollbar custom-scrollbar">
                    {subscribedChannels.length === 0 ? (
                        <p className="text-sm text-gray-500">No subscriptions yet.</p>
                    ) : (
                        subscribedChannels.map((sub) => (
                            <Link to={`/channel/${sub.channelId}`} key={sub.id} className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer group">
                                <div className="relative p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-blue-500 transition-all">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#272727]">
                                        <img
                                            src={sub.channelPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.channelName}`}
                                            alt={sub.channelName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Optional: Indicator for new video? */}
                                </div>
                                <p className="text-[11px] font-medium text-center truncate w-full group-hover:text-blue-400 transition-colors text-gray-300">
                                    {sub.channelName}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Feed Header Controls */}
            <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-[22px] font-bold leading-tight tracking-tight">Latest</h2>
                <div className="flex items-center gap-4">
                    <div className="flex h-9 items-center bg-[#272727] rounded-lg p-1">
                        <label className={`flex cursor-pointer h-full items-center justify-center rounded-md px-3 transition-colors ${viewMode === 'grid' ? 'bg-[#3F3F3F] text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                            <Grid size={20} />
                            <input
                                className="hidden"
                                name="view-toggle"
                                type="radio"
                                value="Grid"
                                checked={viewMode === 'grid'}
                                onChange={() => setViewMode('grid')}
                            />
                        </label>
                        <label className={`flex cursor-pointer h-full items-center justify-center rounded-md px-3 transition-colors ${viewMode === 'list' ? 'bg-[#3F3F3F] text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                            <ListIcon size={20} />
                            <input
                                className="hidden"
                                name="view-toggle"
                                type="radio"
                                value="List"
                                checked={viewMode === 'list'}
                                onChange={() => setViewMode('list')}
                            />
                        </label>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:bg-blue-400/10 px-3 py-2 rounded-lg transition-colors">
                        Manage Subscriptions
                    </button>
                </div>
            </div>

            {/* Video Grid Feed */}
            {videos.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                    <p>No videos from your subscriptions found.</p>
                </div>
            ) : (
                <div className={`px-6 pb-12 ${viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8'
                    : 'flex flex-col gap-4 max-w-4xl mx-auto'
                    }`}>
                    {videos.map((video) => (
                        <div key={video.id} className={viewMode === 'list' ? 'flex gap-4' : ''}>
                            <VideoCard video={video} />
                            {/* Note: VideoCard is currently designed for grid. We might need a 'horizontal' prop for list view. 
                                 For now, 'list' mode effectively just stacks standard cards. 
                                 Refining VideoCard for list view is a UI polish step. 
                             */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
