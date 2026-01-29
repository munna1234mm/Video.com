import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = async () => {
        if (!auth || !googleProvider) {
            alert("Firebase is not initialized correctly. Please check your configuration.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                alert("Sign in was cancelled.");
            } else if (error.code === 'auth/unauthorized-domain') {
                alert("Domain not authorized! Add this domain to Firebase Console > Authentication > Settings > Authorized Domains.");
            } else {
                alert("Login failed: " + error.message);
            }
        }
    };

    const logout = () => {
        if (!auth) return;
        return signOut(auth);
    };

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

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center h-screen bg-[#0F0F0F] text-white">
                    <div className="flex flex-col items-center gap-4 text-center px-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg font-medium">Loading YouTube Lite...</p>
                        <p className="text-xs text-gray-500">If this screen persists, please check your Firebase configuration on Render.</p>
                    </div>
                </div>
            ) : !auth ? (
                <div className="flex items-center justify-center h-screen bg-[#0F0F0F] text-white">
                    <div className="flex flex-col items-center gap-4 text-center px-6">
                        <div className="bg-red-500/20 p-4 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>
                        <h2 className="text-xl font-bold">Configuration Error</h2>
                        <p className="text-gray-400 max-w-md">The application failed to initialize because the Firebase configuration is missing or invalid.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-white text-black px-6 py-2 rounded-full font-medium mt-2 hover:bg-gray-200 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
