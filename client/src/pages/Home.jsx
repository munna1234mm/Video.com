import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORIES = [
    "All", "Gaming", "Music", "Live", "Mixes", "React Routers",
    "Computer programming", "Gadgets", "Podcasts", "Sketch comedy", "Recent"
];

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "videos"));
                const videoList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(videoList);
            } catch (err) {
                console.error("Error fetching videos from Firestore:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [selectedCategory]);

    return (
        <div className="w-full h-full pt-4">
            {/* Category Pills */}
            <div className="flex gap-3 overflow-x-auto pb-4 px-4 sticky top-14 bg-[#0F0F0F] z-30 no-scrollbar">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${selectedCategory === category
                                ? 'bg-white text-black'
                                : 'bg-[#272727] text-white hover:bg-[#3F3F3F]'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-4 sm:gap-y-8 px-2 sm:px-4 pb-8">
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
