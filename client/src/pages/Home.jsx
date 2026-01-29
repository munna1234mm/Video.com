import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Categories removed as per user request

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVideos = async () => {
        setLoading(true);
        setError(null);
        if (!db) {
            console.warn("Database not initialized yet...");
        }

        try {
            const querySnapshot = await getDocs(collection(db, "videos"));
            const videoList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVideos(videoList);
        } catch (err) {
            console.error("Error fetching videos from Firestore:", err);
            setError("Failed to load videos. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    return (
        <div className="w-full h-full pt-4">

            {/* Video Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-red-500">wifi_off</span>
                    </div>
                    <p className="text-white font-medium mb-1">Something went wrong</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchVideos}
                        className="bg-[#272727] text-white px-6 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-8 px-4 sm:px-4 pb-8 [&>*]:max-w-[350px] sm:[&>*]:max-w-none [&>*]:mx-auto sm:[&>*]:mx-0">
                    {videos.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 mt-10 flex flex-col items-center">
                            <p className="text-xl font-semibold mb-2">No videos yet</p>
                            <p className="text-sm">Be the first to upload a video to this community!</p>
                        </div>
                    ) : (
                        videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
