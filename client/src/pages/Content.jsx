import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Content = () => {
    const { currentUser } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [activeTab, setActiveTab] = useState('Videos');

    // Fetch Videos from Firestore
    useEffect(() => {
        const fetchVideos = async () => {
            if (!currentUser) return;
            try {
                const q = query(
                    collection(db, "videos"),
                    where("userId", "==", currentUser.uid),
                    orderBy("uploadDate", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedVideos = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(fetchedVideos);
            } catch (error) {
                console.error("Error fetching studio content:", error);
            } finally {
                setLoading(false);
            }
        };

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
                    <h2 className="text-2xl font-bold mb-4">Channel content</h2>
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
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#102216] text-white text-xs font-bold hover:bg-[#102216]/90 transition-all">
                                        <span>Edit</span>
                                        <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#102216]/10 text-[#102216] text-xs font-bold hover:bg-[#102216]/20 transition-all whitespace-nowrap">
                                        <span className="material-symbols-outlined text-sm">playlist_add</span>
                                        <span>Add to playlist</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#102216]/10 text-[#102216] text-xs font-bold hover:bg-[#102216]/20 transition-all whitespace-nowrap">
                                        <span>More actions</span>
                                        <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Controls (Search filter) */}
                <div className="px-8 py-4 flex items-center gap-4">
                    <div className="flex-1 max-w-md">
                        <label className="relative block">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92c9a4]">
                                <span className="material-symbols-outlined text-lg">search</span>
                            </span>
                            <input
                                className="block w-full bg-slate-100 dark:bg-[#23482f] border-none rounded-lg py-2 pl-10 pr-3 placeholder-slate-500 dark:placeholder-[#92c9a4] text-sm focus:ring-1 focus:ring-[#13ec5b] focus:bg-white dark:focus:bg-[#23482f] text-slate-900 dark:text-white"
                                placeholder="Filter videos..."
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
                                    {loading ? (
                                        <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading content...</td></tr>
                                    ) : videos.length === 0 ? (
                                        <tr><td colSpan="7" className="p-8 text-center text-slate-500">No videos found.</td></tr>
                                    ) : (
                                        videos.map(video => (
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
                                                                <Link to={`/upload?edit=${video.id}`} className="p-1.5 rounded-full hover:bg-white/20 text-white" title="Edit details">
                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                </Link>
                                                                <Link to={`/video/${video.id}`} className="p-1.5 rounded-full hover:bg-white/20 text-white" title="View on YouTube">
                                                                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                                                                </Link>
                                                                <button className="p-1.5 rounded-full hover:bg-white/20 text-white" title="Options">
                                                                    <span className="material-symbols-outlined text-lg">more_vert</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 min-w-0 py-1">
                                                            <Link to={`/video/${video.id}`} className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] hover:underline">
                                                                {video.title}
                                                            </Link>
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
                                        ))
                                    )}
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
            </div>
        </div>
    );
};

export default Content;
