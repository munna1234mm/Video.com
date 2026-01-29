import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Video = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }
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

    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        if (id && db) {
            const q = query(

                collection(db, "videos", id, "comments"),
                orderBy("timestamp", "desc")
            );
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const commentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(commentsData);
            });
            return () => unsubscribe();
        }
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!currentUser) return addToast("Please sign in to comment", "error");
        if (!newComment.trim()) return;

        try {
            await addDoc(collection(db, "videos", id, "comments"), {
                userId: currentUser.uid,
                userName: currentUser.displayName || "User",
                userPhoto: currentUser.photoURL,
                text: newComment,
                timestamp: serverTimestamp()
            });
            setNewComment("");
            addToast("Comment added", "success");
        } catch (error) {
            console.error("Error adding comment:", error);
            addToast("Failed to add comment", "error");
        }
    };

    const handleSubscribe = async () => {
        if (!currentUser) return addToast("Please sign in to subscribe", "error");
        if (!video.userId) return;

        // Fake Subscribe Logic for now (just increments user doc)
        // In real app, we'd check if already subscribed
        try {
            const channelRef = doc(db, "users", video.userId);
            await setDoc(channelRef, { subscribers: increment(1) }, { merge: true });
            addToast("Subscribed!", "success");
        } catch (error) {
            console.error("Error subscribing:", error);
        }
    };

    // Handle Copy Link with Toast
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast("Link copied to clipboard", "success");
    };

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
                            onClick={handleSubscribe}
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
                                        addToast("Login required to like!", "error");
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
                            onClick={handleCopyLink}
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

                    {/* Add Comment Form */}
                    <form onSubmit={handleComment} className="flex gap-4 mb-8">
                        {currentUser ? (
                            <img src={currentUser.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs">?</div>
                        )}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-transparent border-b border-[#3F3F3F] focus:border-white focus:outline-none pb-1 text-sm text-white placeholder-gray-400"
                            />
                            {newComment && (
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewComment("")}
                                        className="text-gray-400 text-sm hover:text-white px-3 py-1.5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 text-white"
                                    >
                                        Comment
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <img
                                    src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                                    alt={comment.userName}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-xs text-white">{comment.userName}</h4>
                                        <span className="text-xs text-gray-400">
                                            {comment.timestamp?.seconds ? new Date(comment.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-200">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Video;
