import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ChannelCustomization = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // UI State
    const [activeTab, setActiveTab] = useState('layout'); // layout | branding | basic
    const [loading, setLoading] = useState(false);

    // Data State
    const [userData, setUserData] = useState({
        displayName: '',
        photoURL: '',
        bannerURL: '',
        description: '',
        subscribers: 0,
        email: ''
    });

    // Form Previews
    const [previewPhoto, setPreviewPhoto] = useState('');
    const [previewBanner, setPreviewBanner] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            let data = {};
            if (docSnap.exists()) {
                data = docSnap.data();
            }

            setUserData({
                displayName: currentUser.displayName || data.displayName || '',
                photoURL: currentUser.photoURL || data.photoURL || '',
                bannerURL: data.bannerURL || '',
                description: data.description || '',
                subscribers: data.subscribers || 0,
                email: currentUser.email
            });
            setPreviewPhoto(currentUser.photoURL || data.photoURL || '');
            setPreviewBanner(data.bannerURL || '');
        };
        fetchData();
    }, [currentUser]);


    const handleFileChange = (e, type) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            if (type === 'photo') {
                setPhotoFile(file);
                setPreviewPhoto(url);
            } else if (type === 'banner') {
                setBannerFile(file);
                setPreviewBanner(url);
            }
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'developeer');
        formData.append('cloud_name', 'da8dgsbfn');

        const res = await fetch(`https://api.cloudinary.com/v1_1/da8dgsbfn/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.secure_url;
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            let photoURL = userData.photoURL;
            let bannerURL = userData.bannerURL;

            if (photoFile) photoURL = await uploadToCloudinary(photoFile);
            if (bannerFile) bannerURL = await uploadToCloudinary(bannerFile);

            // Update Auth Profile
            await updateProfile(currentUser, {
                displayName: userData.displayName,
                photoURL: photoURL
            });

            // Update Firestore
            await setDoc(doc(db, "users", currentUser.uid), {
                ...userData,
                photoURL,
                bannerURL,
                uid: currentUser.uid // Ensure UID is set
            }, { merge: true });

            addToast("Changes published successfully!", "success");
            navigate(`/channel/${currentUser.uid}`);
        } catch (error) {
            console.error(error);
            addToast("Failed to publish changes", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white font-['Spline_Sans']">
            {/* Sidebar Navigation - Styled as requested */}
            <aside className="w-64 border-r border-slate-200 dark:border-[#233648] bg-[#f6f7f8] dark:bg-[#101922] flex flex-col p-4 gap-6 hidden lg:flex">
                <div className="flex items-center gap-3 px-2">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700"
                        style={{ backgroundImage: `url("${previewPhoto || 'https://via.placeholder.com/150'}")` }}
                    ></div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-slate-900 dark:text-white text-base font-medium leading-normal truncate">Creator Studio</h1>
                        <p className="text-slate-500 dark:text-[#92adc9] text-sm font-normal leading-normal">Your Channel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                    {['Dashboard', 'Content', 'Analytics', 'Comments', 'Customization', 'Settings'].map((item) => (
                        <div
                            key={item}
                            onClick={() => {
                                if (item === 'Customization') return;
                                // Placeholder specific toast
                                addToast(`${item} coming soon!`);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${item === 'Customization'
                                    ? 'bg-[#137fec]/10 dark:bg-[#233648] text-[#137fec] dark:text-white'
                                    : 'hover:bg-slate-100 dark:hover:bg-[#233648] text-slate-600 dark:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${item === 'Customization' ? 'fill-current' : ''}`}>
                                {item === 'Dashboard' ? 'dashboard' :
                                    item === 'Content' ? 'video_library' :
                                        item === 'Analytics' ? 'analytics' :
                                            item === 'Comments' ? 'comment' :
                                                item === 'Customization' ? 'edit' : 'settings'}
                            </span>
                            <p className="text-sm font-medium">{item}</p>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#f6f7f8] dark:bg-[#101922]">
                {/* Header */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-[#233648] px-8 py-4 sticky top-0 bg-[#f6f7f8] dark:bg-[#101922] z-10">
                    <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                        <div className="size-6 text-[#137fec]">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold">Channel customization</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/channel/${currentUser.uid}`)}
                            className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-200 dark:bg-[#233648] text-slate-900 dark:text-white text-sm font-bold hover:opacity-90"
                        >
                            View Channel
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-5xl mx-auto">
                        {/* Tabs */}
                        <div className="mb-8 border-b border-slate-200 dark:border-[#324d67]">
                            <div className="flex gap-8">
                                {['Layout', 'Branding', 'Basic info'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                        className={`pb-3 pt-2 text-sm font-bold tracking-wide border-b-[3px] transition-colors ${activeTab === tab.toLowerCase().split(' ')[0]
                                                ? 'border-[#137fec] text-[#137fec] dark:text-white'
                                                : 'border-transparent text-slate-500 dark:text-[#92adc9] hover:text-slate-800 dark:hover:text-white'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Layout Tab Content */}
                        {activeTab === 'layout' && (
                            <div className="animate-fade-in space-y-10">
                                <section>
                                    <h2 className="text-[22px] font-bold mb-2">Video spotlight</h2>
                                    <p className="text-slate-600 dark:text-[#92adc9] mb-6">Add a video to the top of your channel home page</p>

                                    <div className="space-y-4">
                                        {/* Mockup for Spotlight Videos */}
                                        <div className="flex items-start gap-6 p-5 rounded-xl border border-slate-200 dark:border-[#233648] bg-white dark:bg-[#16222e]">
                                            <div className="w-48 aspect-video bg-slate-100 dark:bg-[#233648] rounded-lg flex items-center justify-center relative group">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">play_circle</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">Channel trailer for people who haven't subscribed</h3>
                                                <p className="text-slate-500 dark:text-[#92adc9] text-sm mb-4">Share a preview of your channel shown with people who haven't subscribed yet.</p>
                                                <div className="flex gap-2">
                                                    <button className="text-[#137fec] text-sm font-bold uppercase">Add</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 p-5 rounded-xl border border-slate-200 dark:border-[#233648] bg-white dark:bg-[#16222e]">
                                            <div className="w-48 aspect-video bg-slate-100 dark:bg-[#233648] rounded-lg flex items-center justify-center relative group">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">play_circle</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">Featured video for returning subscribers</h3>
                                                <p className="text-slate-500 dark:text-[#92adc9] text-sm mb-4">Highlight a video for your subscribers to watch.</p>
                                                <div className="flex gap-2">
                                                    <button className="text-[#137fec] text-sm font-bold uppercase">Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-[22px] font-bold">Featured sections</h2>
                                        <button className="flex items-center gap-2 text-[#137fec] text-sm font-bold uppercase hover:bg-[#137fec]/10 px-4 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[20px]">add</span> Add Section
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-[#92adc9] mb-6">Customize the layout of your channel home page</p>

                                    <div className="bg-white dark:bg-[#16222e] rounded-xl border border-slate-200 dark:border-[#233648] divide-y divide-slate-200 dark:divide-[#233648]">
                                        {['Short videos', 'Videos (Uploads)'].map((sec) => (
                                            <div key={sec} className="flex items-center gap-4 p-4">
                                                <span className="material-symbols-outlined text-slate-400 cursor-grab">drag_indicator</span>
                                                <div className="flex-1">
                                                    <p className="font-medium">{sec}</p>
                                                    <p className="text-xs text-slate-500 dark:text-[#92adc9]">Visibility: Public</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Branding Tab Content */}
                        {activeTab === 'branding' && (
                            <div className="animate-fade-in space-y-12">
                                <section className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-full md:w-1/3">
                                        <h3 className="text-lg font-bold mb-2">Picture</h3>
                                        <p className="text-slate-500 dark:text-[#92adc9] text-sm">Your profile picture will appear where your channel is presented on the platform.</p>
                                    </div>
                                    <div className="flex-1 flex gap-6 items-center bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-[#233648]">
                                        <div className="relative size-32 shrink-0 rounded-full border-4 border-slate-200 dark:border-[#324d67] overflow-hidden">
                                            {previewPhoto ? <img src={previewPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-[#233648]" />}
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <p className="text-xs text-slate-500 dark:text-[#92adc9]">Recommended: 98 x 98 px PNG or GIF.</p>
                                            <div className="flex gap-4">
                                                <label className="text-[#137fec] text-sm font-bold uppercase cursor-pointer hover:underline">
                                                    Change
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                                </label>
                                                <button className="text-slate-500 dark:text-[#92adc9] text-sm font-bold uppercase hover:text-slate-900 dark:hover:text-white">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="w-full md:w-1/3">
                                        <h3 className="text-lg font-bold mb-2">Banner image</h3>
                                        <p className="text-slate-500 dark:text-[#92adc9] text-sm">This image will appear across the top of your channel.</p>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-[#233648] flex flex-col gap-6">
                                        <div className="w-full aspect-video bg-gray-200 dark:bg-[#233648] rounded-lg relative overflow-hidden">
                                            {previewBanner && <img src={previewBanner} className="w-full h-full object-cover opacity-50" />}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[10px] text-white bg-black/40 px-2 py-1 rounded">Preview</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-slate-500 dark:text-[#92adc9]">Recommended: 2048 x 1152 px.</p>
                                            <div className="flex gap-4">
                                                <label className="text-[#137fec] text-sm font-bold uppercase cursor-pointer hover:underline">
                                                    Change
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                                                </label>
                                                <button className="text-slate-500 dark:text-[#92adc9] text-sm font-bold uppercase hover:text-slate-900 dark:hover:text-white">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Basic Info Tab Content */}
                        {activeTab === 'basic' && (
                            <div className="animate-fade-in space-y-8">
                                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-slate-200 dark:border-[#233648] space-y-6">
                                    <div>
                                        <h3 className="font-bold mb-2">Name</h3>
                                        <input
                                            type="text"
                                            value={userData.displayName}
                                            onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-[#1F1F1F] border border-slate-300 dark:border-[#303030] rounded-lg p-3 outline-none focus:border-[#137fec]"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-2">Description</h3>
                                        <textarea
                                            rows="5"
                                            value={userData.description}
                                            onChange={(e) => setUserData({ ...userData, description: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-[#1F1F1F] border border-slate-300 dark:border-[#303030] rounded-lg p-3 outline-none focus:border-[#137fec]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChannelCustomization;
