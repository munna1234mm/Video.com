import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Trash2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';

const History = () => {
    const { currentUser } = useAuth();
    const [historyVideos, setHistoryVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || !db) {
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                const historyRef = collection(db, "users", currentUser.uid, "history");
                const q = query(historyRef, orderBy("viewedAt", "desc"));
                const querySnapshot = await getDocs(q);

                const videos = querySnapshot.docs.map(doc => ({
                    id: doc.data().videoId, // The actual video ID
                    historyDocId: doc.id, // ID of the history record
                    ...doc.data()
                }));

                setHistoryVideos(videos);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const clearHistory = async () => {
        if (!confirm("Are you sure you want to clear your watch history?")) return;

        try {
            const historyRef = collection(db, "users", currentUser.uid, "history");
            const snapshot = await getDocs(historyRef);

            // Delete all docs in parallel
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            setHistoryVideos([]);
        } catch (error) {
            console.error("Error clearing history:", error);
            alert("Failed to clear history.");
        }
    };

    if (loading) return (
        <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
    );

    if (!currentUser) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <h2 className="text-xl font-bold mb-2">Keep track of what you watch</h2>
            <p className="text-gray-400 mb-6">Watch history isn't viewable when you're signed out.</p>
        </div>
    );

    return (
        <div className="p-6 md:p-10 text-white min-h-screen">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Watch History</h1>
                    {historyVideos.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-full hover:bg-[#272727] transition-colors"
                        >
                            <Trash2 size={18} />
                            <span>Clear all watch history</span>
                        </button>
                    )}
                </div>

                {historyVideos.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p>No videos in your history yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* We use a different layout for history usually (list view), but reusing Grid for now as requested "like youtube" implies list or grid. YouTube history is List. */}
                        {/* Let's try to mimic a list view for history */}
                        {historyVideos.map((video) => (
                            <div key={video.historyDocId} className="max-w-4xl">
                                {/* Reusing VideoCard but it might look like a grid item. 
                                     Ideally we should make VideoCard support 'horizontal' variant.
                                     For now, let's just stick to the grid layout or wrap VideoCard.
                                 */}
                                <VideoCard video={video} />
                            </div>
                        ))}

                        {/* 
                            Actually, VideoCard is designed as a block. 
                            Let's just use grid layout for consistency with Home page for now, 
                            as user said "youtube er moto" (like YouTube), but YouTube history is a list.
                            However, changing the Card to List view requires modifying the component or making a new one.
                            To keep it simple and robust: Grid layout.
                         */}
                    </div>
                )}

                {/* Rerendering as Grid for better look with current component */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {historyVideos.map((video) => (
                        <VideoCard key={video.historyDocId} video={video} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default History;
