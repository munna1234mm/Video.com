import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PaymentSetup = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Steps State
    const [step, setStep] = useState(1); // 1 = Select Method, 2 = Details

    // Form State
    const [method, setMethod] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        bankName: '',
        branchName: '',
        swiftCode: ''
    });

    const handleMethodSelect = (selectedMethod) => {
        setMethod(selectedMethod);
        setStep(2);
    };

    const handleSave = () => {
        // Here we would typically save to Firestore
        // For now, just simulate success
        addToast("Payment profile updated successfully!", "success");
        navigate('/studio/monetization');
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#102216] text-white font-['Inter']">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#23482f] px-10 py-3 sticky top-0 bg-[#102216] z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-white">
                        <div className="size-6 text-[#13ec5b] flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">play_circle</span>
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] font-display">Studio</h2>
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#13ec5b]/20"
                        style={{ backgroundImage: `url("${currentUser?.photoURL || 'https://via.placeholder.com/150'}")` }}></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[1280px] px-6 lg:px-10 py-8">
                    <div className="flex flex-wrap justify-between items-center gap-3 pb-6">
                        <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em] font-display">Creator Payment Setup</h1>
                        <div className="flex items-center gap-2 text-[#92c9a4] text-sm">
                            <span className="material-symbols-outlined text-[#13ec5b] text-sm">verified</span>
                            <span>Approved Partner</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Payment Profile Card */}
                            <div className="p-8 rounded-xl bg-[#193322] border border-[#23482f] shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-white text-2xl font-black mb-1 font-display">Setup Payment Profile</h2>
                                        <p className="text-[#92c9a4] text-sm">Bangladesh Regional Payment Hub</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#13ec5b]/10 border border-[#13ec5b]/30">
                                            <span className="size-2 rounded-full bg-[#13ec5b]"></span>
                                            <span className="text-[#13ec5b] text-[10px] font-black uppercase tracking-widest">Step {step} of 2</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Step 1: Select Payment Method */}
                                    {step === 1 && (
                                        <div className="space-y-4 animate-fade-in">
                                            <h3 className="text-white font-bold text-lg font-display">Step 1: Select Payment Method</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => handleMethodSelect('bank')}
                                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[#23482f] hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-[#92c9a4] group-hover:text-[#13ec5b] text-3xl">account_balance</span>
                                                    <span className="text-[#92c9a4] group-hover:text-white text-sm font-bold text-center leading-tight">Bank Transfer (SWIFT)</span>
                                                </button>
                                                <button
                                                    onClick={() => handleMethodSelect('wire')}
                                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[#23482f] hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-[#92c9a4] group-hover:text-[#13ec5b] text-3xl">account_balance_wallet</span>
                                                    <span className="text-[#92c9a4] group-hover:text-white text-sm font-bold text-center leading-tight">Local Wire</span>
                                                </button>
                                                <button
                                                    onClick={() => handleMethodSelect('mfs')}
                                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[#23482f] hover:border-[#13ec5b]/50 hover:bg-[#13ec5b]/5 transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-[#92c9a4] group-hover:text-[#13ec5b] text-3xl">smartphone</span>
                                                    <span className="text-[#92c9a4] group-hover:text-white text-sm font-bold text-center leading-tight">MFS (bKash/Nagad)</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Details Form */}
                                    {step === 2 && (
                                        <div className="animate-fade-in">
                                            <h3 className="text-white font-bold text-lg font-display mb-6">Step 2: {method === 'mfs' ? 'MFS Account Details' : 'Bank Account Details'}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-[#92c9a4] uppercase tracking-wider">Account Holder Name</label>
                                                    <input
                                                        type="text"
                                                        value={bankDetails.accountHolder}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                                        className="w-full bg-[#102216] border border-[#23482f] rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b] outline-none transition-all placeholder-[#5a8569]"
                                                        placeholder="Legal name as on records"
                                                    />
                                                </div>
                                                {method === 'mfs' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-[#92c9a4] uppercase tracking-wider">Mobile Number</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-[#102216] border border-[#23482f] rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b] outline-none transition-all placeholder-[#5a8569]"
                                                            placeholder="01XXXXXXXXX"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-[#92c9a4] uppercase tracking-wider">Bank Name</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.bankName}
                                                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                                className="w-full bg-[#102216] border border-[#23482f] rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b] outline-none transition-all placeholder-[#5a8569]"
                                                                placeholder="e.g. Dutch-Bangla Bank"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-[#92c9a4] uppercase tracking-wider">Branch Name</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.branchName}
                                                                onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                                                                className="w-full bg-[#102216] border border-[#23482f] rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b] outline-none transition-all placeholder-[#5a8569]"
                                                                placeholder="e.g. Gulshan Branch"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-[#92c9a4] uppercase tracking-wider">SWIFT Code / Routing Number</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.swiftCode}
                                                                onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                                                                className="w-full bg-[#102216] border border-[#23482f] rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-[#13ec5b] focus:border-[#13ec5b] outline-none transition-all placeholder-[#5a8569]"
                                                                placeholder="Enter code"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="pt-6 flex justify-end gap-4 mt-4 border-t border-[#23482f]/50">
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="px-6 py-3 rounded-lg border border-[#23482f] text-[#92c9a4] font-bold hover:bg-[#23482f] transition-colors"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    className="px-10 py-3 rounded-lg bg-[#13ec5b] text-[#102216] font-black hover:brightness-110 transition-all shadow-lg shadow-[#13ec5b]/20"
                                                >
                                                    Save & Continue
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Revenue Card */}
                            <div className="p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-[#193322] border border-[#23482f] flex flex-col md:flex-row gap-6">
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-[#92c9a4] text-sm font-medium uppercase tracking-wider font-display">Estimated Revenue</h3>
                                        <p className="text-white text-4xl font-black mt-1">$0.00</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="flex items-center text-[#13ec5b] bg-[#13ec5b]/10 px-2 py-0.5 rounded text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                                                +0%
                                            </span>
                                            <span className="text-[#92c9a4] text-xs">vs. last month</span>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[#193322] border border-[#23482f] text-white text-sm font-bold hover:bg-[#23482f] transition-all font-display">
                                            <span>Analytics</span>
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-[1.5] h-48 bg-gradient-to-t from-[#13ec5b]/5 to-transparent rounded-lg border border-[#23482f]/50 relative overflow-hidden flex items-end">
                                    {/* Placeholder Graph */}
                                    <svg className="w-full h-32 text-[#13ec5b]" preserveAspectRatio="none" viewBox="0 0 400 100">
                                        <path d="M0 80 Q 50 70, 80 50 T 150 60 T 220 30 T 300 40 T 400 10" fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke"></path>
                                        <path d="M0 80 Q 50 70, 80 50 T 150 60 T 220 30 T 300 40 T 400 10 V 100 H 0 Z" fill="currentColor" fillOpacity="0.1" vectorEffect="non-scaling-stroke"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Status Card */}
                            <div className="p-6 rounded-xl bg-[#193322] border border-red-500/20 shadow-lg ring-1 ring-red-500/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <span className="material-symbols-outlined">notification_important</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg font-display">Get Paid</h3>
                                </div>
                                <div className="mb-6">
                                    <p className="text-[#92c9a4] text-sm mb-1 leading-relaxed">Status:</p>
                                    <p className="text-red-400 font-bold text-lg">Action Required</p>
                                </div>
                                <div className="p-4 rounded-lg bg-[#102216] border border-red-500/20 mb-6">
                                    <p className="text-xs text-[#92c9a4] leading-relaxed">
                                        Your payment profile is incomplete. We cannot issue payments until your banking details are verified.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-[#193322] border border-[#23482f] overflow-hidden relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg font-display">Payment History</h3>
                                    <span className="material-symbols-outlined text-[#92c9a4]">history</span>
                                </div>
                                <div className="py-4 border-y border-[#23482f]/30 mb-4 text-center">
                                    <p className="text-[#92c9a4] text-xs">No payment history yet.</p>
                                </div>
                                <p className="text-[#92c9a4] text-xs leading-relaxed">Complete your payment setup to start receiving your monthly earnings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentSetup;
