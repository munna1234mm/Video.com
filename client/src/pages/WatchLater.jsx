import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Clock } from 'lucide-react';
import VideoCard from '../components/VideoCard';

const WatchLater = () => {
    const { currentUser } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || !db) {
            setLoading(false);
            return;
        }

        const fetchWatchLater = async () => {
            try {
                const wlRef = collection(db, "users", currentUser.uid, "watchLater");
                const q = query(wlRef, orderBy("savedAt", "desc"));
                const querySnapshot = await getDocs(q);

                const fetchedVideos = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.data().videoId
                }));

                setVideos(fetchedVideos);
            } catch (error) {
                console.error("Error fetching watch later:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchLater();
    }, [currentUser]);

    if (loading) return (
        <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
    );

    if (!currentUser) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <h2 className="text-xl font-bold mb-2">Sign in to view your list</h2>
            <p className="text-gray-400">Your watch later list will appear here.</p>
        </div>
    );

    return (
        <div className="p-6 md:p-10 text-white min-h-screen">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Watch Later</h1>
                        <p className="text-gray-400 text-sm">{videos.length} videos</p>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p>No videos saved for later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {videos.map((video, index) => (
                            <VideoCard key={`${video.id}-${index}`} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchLater;
