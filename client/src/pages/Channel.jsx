import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import VideoCard from '../components/VideoCard';
import { Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EditChannelModal from '../components/EditChannelModal';

const Channel = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [channelData, setChannelData] = useState(null);
    const [channelName, setChannelName] = useState('Channel');
    const [activeTab, setActiveTab] = useState('videos');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const isOwner = currentUser?.uid === uid;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Channel User Data (for Banner, Description, etc.)
                const userDocRef = doc(db, "users", uid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                    setChannelData(userSnap.data());
                    setChannelName(userSnap.data().displayName || 'Channel');
                }

                // 2. Fetch Videos
                const q = query(collection(db, "videos"), where("userId", "==", uid));
                const querySnapshot = await getDocs(q);
                const videoList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(videoList);

                // Fallback for name if user doc doesn't exist or is loading
                if (!userSnap.exists() && videoList.length > 0) {
                    setChannelName(videoList[0].uploader || 'Channel');
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [uid, currentUser, isOwner]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Channel link copied to clipboard!");
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-[#0F0F0F] text-white">
            {/* Channel Banner */}
            <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                {channelData?.bannerURL ? (
                    <img src={channelData.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                        <span className="opacity-20 text-4xl font-bold">BANNER AREA</span>
                    </div>
                )}
            </div>

            {/* Channel Header Info */}
            <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-[#272727]">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-[#0F0F0F] -mt-12 md:-mt-16 z-10 shrink-0 overflow-hidden">
                    {/* Use Google Photo logic if available */}
                    {channelData?.photoURL ? (
                        <img src={channelData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        channelName[0]?.toUpperCase() || <UserCircle className="w-20 h-20" />
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold">{channelName}</h1>
                    <p className="text-gray-400">@{channelName.replace(/\s/g, '').toLowerCase()} • {videos.length} videos</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-2xl line-clamp-2">
                        {channelData?.description || `Welcome to ${channelName}'s channel. Subscribe for more content!`}
                    </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                    <button
                        onClick={handleShare}
                        className="bg-[#272727] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors"
                    >
                        Share
                    </button>
                    {isOwner ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/studio/customization')}
                                className="bg-[#272727] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors"
                            >
                                Customize Channel
                            </button>
                            <button className="bg-[#272727] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors">
                                Manage Videos
                            </button>
                        </div>
                    ) : (
                        <button className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
                            Subscribe
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-4 md:px-12 flex gap-8 border-b border-[#272727] sticky top-0 bg-[#0F0F0F] z-20">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'videos' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Videos
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`py-3 font-medium border-b-2 transition-colors ${activeTab === 'about' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    About
                </button>
            </div>

            {/* Tab Content */}
            <div className="px-4 md:px-12 py-6">
                {activeTab === 'videos' && (
                    <>
                        <h2 className="text-lg font-bold mb-4">Latest Videos</h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {videos.length === 0 ? (
                                    <div className="col-span-full text-center text-gray-500 py-10">
                                        This channel has no videos yet.
                                    </div>
                                ) : (
                                    videos.map((video) => (
                                        <VideoCard key={video.id} video={video} />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'about' && (
                    <div className="max-w-3xl">
                        <h3 className="text-lg font-bold mb-4">Description</h3>
                        <p className="text-gray-300 bg-[#272727] p-4 rounded-lg">
                            This is the official channel of {channelName}. Here you will find videos about technology, coding, and more.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm text-gray-400 font-bold mb-2">Stats</h4>
                                <p className="text-sm">Joined {new Date().toLocaleDateString()}</p>
                                <p className="text-sm">{videos.length} videos</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <EditChannelModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};

export default Channel;
