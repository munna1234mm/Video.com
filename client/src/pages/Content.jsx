import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { sampleVideos } from '../utils/sampleData';

const EditVideoModal = ({ isOpen, onClose, video, onSave }) => {
    const [title, setTitle] = useState(video?.title || '');
    const [description, setDescription] = useState(video?.description || '');

    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setDescription(video.description);
        }
    }, [video]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#1F1F1F] rounded-xl w-full max-w-lg shadow-2xl border border-[#303030] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[#303030]">
                    <h3 className="text-xl font-bold text-white">Edit video</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Title (required)</label>
                        <textarea
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none min-h-[80px]"
                            placeholder="Add a title that describes your video"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 resize-none min-h-[120px]"
                            placeholder="Tell viewers about your video"
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-[#303030] flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white font-medium">Cancel</button>
                    <button
                        onClick={() => onSave(video.id, { title, description })}
                        disabled={!title.trim()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const Content = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [activeTab, setActiveTab] = useState('Videos');
    const [editingVideo, setEditingVideo] = useState(null);
    const [error, setError] = useState(null);

    // Fetch Videos from Firestore
    const fetchVideos = async () => {
        if (!currentUser) return;
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, "videos"),
                where("userId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const fetchedVideos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVideos(fetchedVideos);
        } catch (error) {
            console.error("Error fetching studio content:", error);
            setError("Failed to load videos. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [currentUser]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedVideos(videos.map(v => v.id));
        else setSelectedVideos([]);
    };

    const handleSelectOne = (id) => {
        if (selectedVideos.includes(id)) setSelectedVideos(prev => prev.filter(vid => vid !== id));
        else setSelectedVideos(prev => [...prev, id]);
    };

    const handleDelete = async (ids) => {
        if (!window.confirm(`Are you sure you want to delete ${ids.length} video(s)? This action cannot be undone.`)) return;

        try {
            // In a real app we'd wait for all, but for UI responsiveness we can just do it
            await Promise.all(ids.map(id => deleteDoc(doc(db, "videos", id))));

            setVideos(prev => prev.filter(v => !ids.includes(v.id)));
            setSelectedVideos(prev => prev.filter(id => !ids.includes(id)));
            addToast("Video(s) deleted successfully", "success");
        } catch (error) {
            console.error("Delete error:", error);
            addToast("Failed to delete video(s)", "error");
        }
    };

    const handleUpdateVideo = async (id, updates) => {
        try {
            await updateDoc(doc(db, "videos", id), updates);
            setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
            setEditingVideo(null);
            addToast("Video updated successfully", "success");
        } catch (error) {
            console.error("Update error:", error);
            addToast("Failed to update video", "error");
        }
    };

    const handleLoadSamples = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const promises = sampleVideos.map(async (v) => {
                return addDoc(collection(db, "videos"), {
                    ...v,
                    userId: currentUser.uid,
                    uploader: currentUser.displayName || 'Creator',
                    uploadDate: serverTimestamp(),
                    views: Math.floor(Math.random() * 10000),
                    likes: Math.floor(Math.random() * 1000),
                    dislikes: Math.floor(Math.random() * 100),
                    comments: []
                });
            });
            await Promise.all(promises);
            addToast("Sample videos loaded successfully", "success");
            fetchVideos();
        } catch (error) {
            console.error("Load samples error:", error);
            addToast("Failed to load sample videos", "error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        // Handle Firestore Timestamp or standard Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#f6f8f6] dark:bg-[#102216] text-slate-900 dark:text-white font-display">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header/Tabs */}
                <header className="pt-6 px-8 border-b border-slate-200 dark:border-[#326744]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Channel content</h2>
                        {!loading && videos.length > 0 && (
                            <Link
                                to="/upload"
                                className="bg-[#13ec5b] text-[#102216] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#13ec5b]/90 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">videocam</span>
                                <span>Create</span>
                            </Link>
                        )}
                    </div>
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['Videos', 'Live', 'Posts', 'Playlists', 'Podcasts'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex flex-col items-center border-b-[3px] pb-3 px-2 font-bold text-sm transition-colors whitespace-nowrap
                                    ${activeTab === tab
                                        ? 'border-[#13ec5b] text-slate-900 dark:text-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-[#92c9a4] dark:hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                {/* ToolBar / Bulk Actions Bar (Sticky) */}
                {selectedVideos.length > 0 && (
                    <div className="px-8 mt-4 animate-in slide-in-from-top duration-300">
                        <div className="bg-[#13ec5b] flex items-center justify-between px-4 py-2 rounded-lg shadow-lg">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSelectedVideos([])} className="p-1 text-[#102216] hover:bg-[#102216]/10 rounded">
                                        <span className="material-symbols-outlined text-2xl font-bold">close</span>
                                    </button>
                                    <span className="text-[#102216] font-bold text-sm">{selectedVideos.length} selected</span>
                                </div>
                                <div className="h-6 w-px bg-[#102216]/20"></div>
                                <div className="flex gap-1 overflow-x-auto">
                                    <button
                                        onClick={() => handleDelete(selectedVideos)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#102216] text-white text-xs font-bold hover:bg-[#102216]/90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        <span>Delete forever</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Viewport */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 dark:text-[#92c9a4] font-medium">Fetching your content...</p>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
                            <div className="w-64 h-64 mb-8 relative">
                                <div className="absolute inset-0 bg-[#13ec5b]/10 rounded-full animate-pulse"></div>
                                <div className="absolute inset-4 bg-[#13ec5b]/20 rounded-full animate-pulse delay-75"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-8xl text-[#13ec5b] drop-shadow-[0_0_15px_rgba(19,236,91,0.5)]">
                                        video_library
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Your video journey starts here</h3>
                            <p className="text-slate-500 dark:text-[#92c9a4] text-lg mb-10 max-w-md">
                                Upload your first video to get started. Or, load some sample data to see how your channel will look.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Link
                                    to="/upload"
                                    className="bg-[#13ec5b] text-[#102216] px-10 py-4 rounded-xl font-black text-lg hover:bg-[#13ec5b]/90 transition-all shadow-xl shadow-[#13ec5b]/20 flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined font-bold">upload</span>
                                    <span>Upload Video</span>
                                </Link>
                                <button
                                    onClick={handleLoadSamples}
                                    className="bg-white/5 dark:bg-[#23482f]/50 border border-slate-200 dark:border-[#326744] text-slate-900 dark:text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 dark:hover:bg-[#23482f]/70 transition-all flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">dataset</span>
                                    <span>Load Samples</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Table Controls (Search filter) */}
                            <div className="px-8 py-4 flex items-center gap-4">
                                <div className="flex-1 max-w-md">
                                    <label className="relative block">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92c9a4]">
                                            <span className="material-symbols-outlined text-lg">search</span>
                                        </span>
                                        <input
                                            className="block w-full bg-slate-100 dark:bg-[#23482f] border-none rounded-lg py-2 pl-10 pr-3 placeholder-slate-500 dark:placeholder-[#92c9a4] text-sm focus:ring-1 focus:ring-[#13ec5b] focus:bg-white dark:focus:bg-[#23482f] text-slate-900 dark:text-white"
                                            placeholder="Filter videos by title..."
                                            type="text"
                                        />
                                    </label>
                                </div>
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#23482f] text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#2d5c3c] transition-colors">
                                    <span className="material-symbols-outlined text-lg">filter_list</span>
                                    <span>Filter</span>
                                </button>
                            </div>

                            {/* Table Content */}
                            <div className="flex-1 overflow-auto px-8 pb-8">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden border border-slate-200 dark:border-[#326744] rounded-xl bg-white dark:bg-[#15291c]">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-[#326744]">
                                            <thead className="bg-slate-50 dark:bg-[#193322]">
                                                <tr>
                                                    <th className="px-4 py-3 w-12 text-center" scope="col">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 dark:border-[#326744] bg-transparent text-[#13ec5b] focus:ring-[#13ec5b] size-4"
                                                            checked={videos.length > 0 && selectedVideos.length === videos.length}
                                                            onChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider" scope="col">Video</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell" scope="col">Visibility</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell" scope="col">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right hidden lg:table-cell" scope="col">Views</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right hidden lg:table-cell" scope="col">Comments</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell" scope="col">Likes (vs Dislikes)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-[#326744]">
                                                {videos.map(video => (
                                                    <tr
                                                        key={video.id}
                                                        className={`group transition-colors ${selectedVideos.includes(video.id) ? 'bg-[#23482f]/30 hover:bg-[#23482f]/50' : 'hover:bg-slate-50 dark:hover:bg-[#193322]'}`}
                                                    >
                                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-slate-300 dark:border-[#326744] bg-transparent text-[#13ec5b] focus:ring-[#13ec5b] size-4"
                                                                checked={selectedVideos.includes(video.id)}
                                                                onChange={() => handleSelectOne(video.id)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4 min-w-[300px]">
                                                            <div className="flex gap-4">
                                                                <div className="relative w-32 h-20 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0 group-hover:opacity-90 transition-opacity">
                                                                    {video.thumbnailUrl ? (
                                                                        <img className="w-full h-full object-cover" src={video.thumbnailUrl} alt={video.title} />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs text-gray-500">No Thumb</div>
                                                                    )}
                                                                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1 rounded-sm">
                                                                        {video.duration || '00:00'}
                                                                    </span>

                                                                    {/* Quick Actions Overlay */}
                                                                    <div className="absolute inset-0 bg-[#102216]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200">
                                                                        <button
                                                                            onClick={() => setEditingVideo(video)}
                                                                            className="p-1.5 rounded-full hover:bg-white/20 text-white"
                                                                            title="Edit details"
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                                        </button>
                                                                        <Link to={`/video/${video.id}`} className="p-1.5 rounded-full hover:bg-white/20 text-white" title="View on YouTube">
                                                                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleDelete([video.id])}
                                                                            className="p-1.5 rounded-full hover:bg-white/20 text-white hover:text-red-400"
                                                                            title="Delete"
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1 min-w-0 py-1">
                                                                    <div className="flex items-center gap-2 group/title">
                                                                        <Link to={`/video/${video.id}`} className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] hover:underline">
                                                                            {video.title}
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => setEditingVideo(video)}
                                                                            className="opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-white transition-opacity"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 dark:text-[#92c9a4] line-clamp-2 max-w-[200px]">
                                                                        {video.description || 'No description'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                                {video.visibility === 'public' ? (
                                                                    <span className="material-symbols-outlined text-[#13ec5b] text-sm">visibility</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-slate-400 text-sm">visibility_off</span>
                                                                )}
                                                                <span className="capitalize">{video.visibility || 'Public'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-[#92c9a4] hidden md:table-cell">
                                                            {formatDate(video.uploadDate)}
                                                            <br />
                                                            <span className="text-[10px]">Published</span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-700 dark:text-white font-medium text-right hidden lg:table-cell">
                                                            {video.views?.toLocaleString() || 0}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-700 dark:text-white font-medium text-right hidden lg:table-cell">
                                                            {video.comments?.length || 0}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#92c9a4]">
                                                                    <span>
                                                                        {video.likes + video.dislikes > 0
                                                                            ? Math.round((video.likes / (video.likes + video.dislikes)) * 100)
                                                                            : 0}%
                                                                    </span>
                                                                    <span>({video.likes} likes)</span>
                                                                </div>
                                                                <div className="w-24 h-1 bg-slate-200 dark:bg-[#326744] rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#13ec5b]"
                                                                        style={{ width: `${video.likes + video.dislikes > 0 ? (video.likes / (video.likes + video.dislikes)) * 100 : 0}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Pagination */}
                            <footer className="px-8 py-3 border-t border-slate-200 dark:border-[#326744] flex items-center justify-between bg-slate-50 dark:bg-[#102216]">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-[#92c9a4]">
                                    <div className="flex items-center gap-2">
                                        <span>Rows per page:</span>
                                        <select className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white py-0 pl-0 pr-6 text-xs font-medium cursor-pointer">
                                            <option>10</option>
                                            <option>30</option>
                                            <option>50</option>
                                        </select>
                                    </div>
                                    <span>1–{videos.length} of {videos.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#23482f] text-slate-400 disabled:opacity-30">
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#23482f] text-slate-400 disabled:opacity-30">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </footer>
                        </>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <EditVideoModal
                isOpen={!!editingVideo}
                onClose={() => setEditingVideo(null)}
                video={editingVideo}
                onSave={handleUpdateVideo}
            />
        </div>
    );
};

export default Content;
