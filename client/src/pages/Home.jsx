import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Categories removed as per user request

const Home = () => {
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
    }, []);

    return (
        <div className="w-full h-full pt-4">

            {/* Video Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
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
