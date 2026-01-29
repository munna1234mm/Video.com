import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Loader2, AlertCircle } from 'lucide-react';

import { doc, getDoc, setDoc, increment, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Video = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Fetch Video Data
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

    // Fetch Comments
    useEffect(() => {
        if (!id || !db) return;

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
        }, (error) => {
            console.error("Comments error:", error);
        });

        return () => unsubscribe();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            addToast("Please sign in to comment", "error");
            return;
        }
        if (!newComment.trim()) return;

        try {
            await addDoc(collection(db, "videos", id, "comments"), {
                text: newComment,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userPhoto: currentUser.photoURL,
                timestamp: serverTimestamp()
            });
            setNewComment("");
            addToast("Comment added!", "success");
        } catch (err) {
            console.error(err);
            addToast("Failed to add comment", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Loader2 className="animate-spin text-white w-10 h-10" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="text-white text-center mt-20">
                <h2 className="text-2xl font-bold">Video not found</h2>
                <button onClick={() => window.history.back()} className="text-blue-500 mt-4 underline">Go Back</button>
            </div>
        );
    }

    // Main content render starts here...
    return (
        <div className="w-full flex justify-center pb-20 overflow-y-auto">
            <div className="max-w-[1280px] w-full px-4 pt-4 flex flex-col lg:flex-row gap-6">
                {/* Left Side: Video Player and Details */}
                <div className="flex-1">
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
                        {!video?.videoURL ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-[#1a1a1a]">
                                <AlertCircle size={48} className="mb-2 opacity-50" />
                                <p>Video source not found.</p>
                            </div>
                        ) : video.videoURL.includes('youtube.com/embed') ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={video.videoURL}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video
                                src={video.videoURL}
                                controls
                                className="w-full h-full object-contain"
                                autoPlay
                                onError={(e) => {
                                    console.error("Video Error:", e.nativeEvent);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        )}
                        {/* Fallback Error UI (Hidden by default) */}
                        <div className="hidden absolute inset-0 flex-col items-center justify-center text-white bg-[#1a1a1a] z-10">
                            <AlertCircle size={48} className="mb-4 text-red-500" />
                            <p className="text-lg font-bold">Video Failed to Load</p>
                            <p className="text-sm text-gray-400 mt-2 max-w-sm text-center">
                                The video file could not be played. It might be corrupted or the URL is invalid.
                            </p>
                            <div className="mt-4 p-2 bg-black/50 rounded text-xs font-mono text-gray-500 max-w-[80%] break-all">
                                {video?.videoURL}
                            </div>
                        </div>
                    </div>


                    {/* Video Title and Info */}
                    <div className="mt-4">
                        <h1 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                            {video.title}
                        </h1>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-white/10">
                                    {video.uploader?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[16px] text-white leading-tight">{video.uploader}</h3>
                                    <p className="text-xs text-gray-400">0 subscribers</p>
                                </div>
                                <button className="bg-white text-black px-4 py-2 rounded-full font-medium ml-4 hover:bg-gray-200 transition-colors">
                                    Subscribe
                                </button>
                            </div>

                            <div className="flex items-center bg-[#272727] rounded-full p-0.5">
                                <button className="flex items-center gap-2 hover:bg-[#3F3F3F] px-4 py-2 rounded-l-full border-r border-white/10 transition-colors group">
                                    <ThumbsUp size={20} className="group-active:scale-125 transition-transform" />
                                    <span className="text-sm font-medium">{video.likes || 0}</span>
                                </button>
                                <button className="hover:bg-[#3F3F3F] px-4 py-2 rounded-r-full transition-colors group">
                                    <ThumbsDown size={20} className="group-active:scale-125 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#272727] p-3 rounded-xl mt-4 cursor-pointer hover:bg-[#3F3F3F] transition-colors">
                            <div className="flex gap-2 font-bold text-sm text-white">
                                <span>{video.views || 0} views</span>
                                <span>{video.timestamp?.toDate ? video.timestamp.toDate().toLocaleDateString() : 'Just now'}</span>
                            </div>
                            <p className="text-sm mt-1 text-white line-clamp-2">
                                {video.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>

                        <form onSubmit={handleComment} className="flex gap-4 mb-6">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center shrink-0">
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-full" />
                                ) : (
                                    currentUser?.displayName?.charAt(0) || '?'
                                )}
                            </div>
                            <div className="flex-1 border-b border-gray-700 focus-within:border-white transition-colors">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent py-2 outline-none text-white"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                disabled={!newComment.trim()}
                            >
                                Comment
                            </button>
                        </form>

                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4">
                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                                        {comment.userPhoto ? (
                                            <img src={comment.userPhoto} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            comment.userName?.charAt(0) || '?'
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">@{comment.userName || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-400">
                                                {comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Related Videos Placeholder */}
                <div className="w-full lg:w-[400px]">
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#272727] p-2 rounded-xl text-center">
                            <p className="text-gray-400 text-sm">Recommended videos appearing soon...</p>
                        </div>
                        {/* More VideoCard components could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Video;
