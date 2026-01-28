import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload, User, Image as ImageIcon, Layout, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChannelCustomization = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('branding');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);

    // Previews
    const [profilePreview, setProfilePreview] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            // Set basic auth data
            setName(currentUser.displayName || '');
            setProfilePreview(currentUser.photoURL || '');

            // Fetch extra data from Firestore (Banner, Description)
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBannerPreview(data.bannerURL || '');
                    setDescription(data.description || '');
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleImageChange = (e, setFile, setPreview) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadFile = async (file, path) => {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        return getDownloadURL(snapshot.ref);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let newPhotoURL = currentUser.photoURL;
            let newBannerURL = bannerPreview; // Default to current preview if not changed

            // 1. Upload Images if changed
            if (profileImage) {
                newPhotoURL = await uploadFile(profileImage, `profiles/${currentUser.uid}_${Date.now()}`);
            }
            if (bannerImage) {
                newBannerURL = await uploadFile(bannerImage, `banners/${currentUser.uid}_${Date.now()}`);
            }

            // 2. Update Auth Profile
            await updateProfile(currentUser, {
                displayName: name,
                photoURL: newPhotoURL
            });

            // 3. Update Firestore
            await setDoc(doc(db, "users", currentUser.uid), {
                uid: currentUser.uid,
                displayName: name,
                email: currentUser.email,
                photoURL: newPhotoURL,
                bannerURL: newBannerURL,
                description: description
            }, { merge: true });

            alert("Changes published successfully!");
            navigate(`/channel/${currentUser.uid}`);
        } catch (err) {
            console.error(err);
            alert("Error saving changes: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-10 text-white text-center">Loading Studio...</div>;

    return (
        <div className="w-full min-h-[calc(100vh-56px)] bg-[#1F1F1F] text-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Channel Customization</h1>

                {/* Tabs */}
                <div className="flex border-b border-[#303030] mb-8">
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'branding'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Branding
                    </button>
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'basic'
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Basic Info
                    </button>
                </div>

                {/* Branding Tab */}
                {activeTab === 'branding' && (
                    <div className="space-y-10 animate-fade-in">
                        {/* Profile Picture */}
                        <div className="bg-[#0F0F0F] p-6 rounded-xl border border-[#303030]">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-1">Picture</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments.
                                    </p>
                                    <div className="flex gap-4">
                                        <label className="text-blue-400 text-sm font-medium cursor-pointer hover:text-blue-300 uppercase">
                                            Change
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, setProfileImage, setProfilePreview)} />
                                        </label>
                                        <button className="text-gray-400 text-sm font-medium hover:text-white uppercase">Remove</button>
                                    </div>
                                </div>
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#272727] shrink-0 border-4 border-[#1F1F1F]">
                                    {profilePreview ? (
                                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Banner Image */}
                        <div className="bg-[#0F0F0F] p-6 rounded-xl border border-[#303030]">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-1">Banner image</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        This image will appear across the top of your channel. For the best results on all devices, use an image that's at least 2048 x 1152 pixels and 6MB or less.
                                    </p>
                                    <div className="flex gap-4">
                                        <label className="text-blue-400 text-sm font-medium cursor-pointer hover:text-blue-300 uppercase">
                                            Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, setBannerImage, setBannerPreview)} />
                                        </label>
                                        <button className="text-gray-400 text-sm font-medium hover:text-white uppercase">Remove</button>
                                    </div>
                                </div>
                                <div className="w-64 h-36 bg-[#272727] rounded-lg overflow-hidden shrink-0 border border-[#303030] relative">
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                                            <Layout className="w-8 h-8" />
                                            <span className="text-xs">No banner</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-[#0F0F0F] p-6 rounded-xl border border-[#303030] space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-4">Name</h3>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#1F1F1F] border border-[#303030] rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Channel Name"
                                />
                                <p className="text-xs text-gray-500 mt-2">Choose a channel name that represents you and your content.</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4">Description</h3>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="5"
                                    className="w-full bg-[#1F1F1F] border border-[#303030] rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors resize-none"
                                    placeholder="Tell viewers about your channel..."
                                />
                                <p className="text-xs text-gray-500 mt-2">Your description will appear in the About section of your channel and search results.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-[#303030]">
                    <button
                        onClick={() => navigate(`/channel/${currentUser.uid}`)}
                        className="px-6 py-2 text-gray-300 font-medium hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors uppercase text-sm tracking-wide disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChannelCustomization;
