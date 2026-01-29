import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        if (!auth || !googleProvider) {
            alert("Firebase not initialized. Check your configuration.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login Error:", error);
            alert(error.message);
        }
    };

    const logout = () => auth && signOut(auth);

    const value = { currentUser, loginWithGoogle, logout };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-[#0F0F0F] text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading YouTube Lite...</p>
                    </div>
                </div>
            ) : !auth ? (
                <div className="flex items-center justify-center min-h-screen bg-[#0F0F0F] text-white p-6">
                    <div className="text-center max-w-md bg-[#1A1A1A] p-8 rounded-3xl border border-red-500/20 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-red-500">Configuration Error</h2>
                        <p className="text-gray-400 mb-6">firebase.js could not initialize. This usually means your Render or local Environment Variables are missing.</p>
                        <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full font-bold">Retry</button>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
