import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import VideoCard from '../components/VideoCard';
import { Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EditChannelModal from '../components/EditChannelModal';

const Channel = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    // ... rest of state

    const linkify = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{part}</a>;
            }
            return part;
        });
    };
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [channelData, setChannelData] = useState(null);
    const [channelName, setChannelName] = useState('Channel');
    const [activeTab, setActiveTab] = useState('videos');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const isOwner = currentUser?.uid === uid;

    // Subscribe State
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                // 1. Fetch Channel User Data (for Banner, Description, etc.)
                const userDocRef = doc(db, "users", uid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                    setChannelData(userSnap.data());
                    setChannelName(userSnap.data().displayName || 'Channel');
                }

                // Check subscription status
                if (currentUser) {
                    const subRef = doc(db, "users", currentUser.uid, "subscriptions", uid);
                    const subSnap = await getDoc(subRef);
                    setSubscribed(subSnap.exists());
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

    const handleSubscribe = async () => {
        if (!currentUser) return addToast("Please sign in to subscribe", "error");
        if (isOwner) return addToast("You cannot subscribe to your own channel", "error");

        try {
            const subRef = doc(db, "users", currentUser.uid, "subscriptions", uid);
            const uploaderRef = doc(db, "users", uid);

            if (subscribed) {
                // Unsubscribe
                await deleteDoc(subRef);
                await setDoc(uploaderRef, { subscribers: increment(-1) }, { merge: true });
                // Optimistic UI updates
                setChannelData(prev => ({ ...prev, subscribers: Math.max(0, (prev?.subscribers || 0) - 1) }));
                addToast("Unsubscribed", "success");
            } else {
                // Subscribe
                await setDoc(subRef, {
                    channelId: uid,
                    channelName: channelName || 'Unknown',
                    channelPhoto: channelData?.photoURL || '',
                    subscribedAt: serverTimestamp()
                });
                await setDoc(uploaderRef, { subscribers: increment(1) }, { merge: true });
                // Optimistic UI updates
                setChannelData(prev => ({ ...prev, subscribers: (prev?.subscribers || 0) + 1 }));
                addToast("Subscribed!", "success");
            }
            setSubscribed(!subscribed);
        } catch (err) {
            console.error("Subscription failed:", err);
            addToast("Failed to subscribe", "error");
        }
    };

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
                        <span className="opacity-20 text-4xl font-bold uppercase tracking-widest">{channelName}</span>
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
                    <p className="text-gray-400">@{channelName.replace(/\s/g, '').toLowerCase()} • {channelData?.subscribers || 0} subscribers • {videos.length} videos</p>
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
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/studio/customization')}
                                className="bg-[#272727] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors whitespace-nowrap"
                            >
                                Customize Channel
                            </button>
                            <button
                                onClick={() => navigate('/studio/content')}
                                className="bg-[#272727] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3F3F3F] transition-colors whitespace-nowrap"
                            >
                                Manage Videos
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${subscribed ? 'bg-[#272727] text-white hover:bg-[#3F3F3F]' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            {subscribed ? 'Subscribed' : 'Subscribe'}
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 [&>*]:max-w-[350px] sm:[&>*]:max-w-none [&>*]:mx-auto sm:[&>*]:mx-0">
                                {videos.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center">
                                        <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-4xl text-gray-500">video_library</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                                        <p className="text-gray-400 max-w-sm">
                                            This channel hasn't uploaded any videos yet. Check back later for new content.
                                        </p>
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
