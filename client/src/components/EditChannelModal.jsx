import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const EditChannelModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState(currentUser?.displayName || '');
    const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser) {
            const fetchUserData = async () => {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setDescription(userDoc.data().description || '');
                }
            };
            fetchUserData();
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(currentUser, {
                displayName: name,
                photoURL: photoURL
            });

            // Save additional data to Firestore
            await setDoc(doc(db, "users", currentUser.uid), {
                displayName: name,
                photoURL: photoURL,
                description: description
            }, { merge: true });

            alert("Channel updated successfully! Refresh to see changes.");
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1F1F1F] w-full max-w-md rounded-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Customize Channel</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Channel Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Enter channel name"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Profile Picture URL</label>
                        <input
                            type="text"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Paste a direct link to an image.</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[100px]"
                            placeholder="Tell viewers about your channel..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Links added here will be clickable on your channel page.</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 font-medium hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditChannelModal;
