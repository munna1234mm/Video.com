import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import VideoCard from '../components/VideoCard';
import { Loader2, UserCircle } from 'lucide-react';

const Channel = () => {
    const { uid } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [channelName, setChannelName] = useState('Channel');

    useEffect(() => {
        const fetchChannelVideos = async () => {
            try {
                // Query videos regarding this userID
                const q = query(collection(db, "videos"), where("userId", "==", uid));
                const querySnapshot = await getDocs(q);
                const videoList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(videoList);

                if (videoList.length > 0) {
                    setChannelName(videoList[0].uploader || 'Channel');
                }
            } catch (err) {
                console.error("Error fetching channel videos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChannelVideos();
    }, [uid]);

    return (
        <div className="w-full h-full pt-4 px-4">
            {/* Channel Header */}
            <div className="flex flex-col items-center justify-center gap-4 mb-8 border-b border-[#272727] pb-8">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {channelName[0]?.toUpperCase() || <UserCircle className="w-16 h-16" />}
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">{channelName}</h1>
                    <p className="text-gray-400">@{channelName.replace(/\s/g, '').toLowerCase()}</p>
                    <p className="text-gray-500 text-sm mt-1">{videos.length} videos</p>
                </div>
                <button className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Subscribe
                </button>
            </div>

            {/* Video Grid */}
            <h2 className="text-xl font-bold text-white mb-4">Uploads</h2>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 pb-8">
                    {videos.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 mt-10">
                            This channel has no videos yet.
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

export default Channel;
