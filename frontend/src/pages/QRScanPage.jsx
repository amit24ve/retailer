import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function QRScanPage() {
  const { qrId } = useParams();
  const [loading, setLoading] = useState(true);
  const [qrDetails, setQrDetails] = useState(null);
  const [mobile, setMobile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Determine if this QR type requires customer data capture
  const isCaptureType = (type) => {
    const captureTypes = [
      'loyalty',
      'birthday',
      'business_card',
      'acquire_biz',
      'pamphlet',
      'events',
      'rewards_check',
      'signup'
    ];
    return captureTypes.includes(type);
  };

  useEffect(() => {
    // We want to fetch the QR details by hitting the scan endpoint.
    // If it's a direct redirect type, we'll record scan with empty mobile and redirect immediately.
    // If it's a capture type, we'll fetch details first (by recording a scan without mobile, or we can just query details if there was a GET, but wait - posting to scan records the scan event, which is perfect!).
    const initScan = async () => {
      try {
        // We call the scan API. For now, we do a scan without a mobile number to retrieve the URL.
        // If it's a direct type, this counts as the scan and we redirect immediately!
        const baseURL = 'https://retailer.avopay.pro:3000/api/v1';
        const res = await axios.post(`${baseURL}/qr-codes/${qrId}/scan`, {
          mobile: '',
          store: 'Online Scan'
        });
        
        const data = res.data;
        setQrDetails(data);

        if (!isCaptureType(data.type)) {
          // Direct redirect!
          setRedirecting(true);
          setTimeout(() => {
            window.location.href = data.url;
          }, 800);
        } else {
          // Capture type! Stop loading and show the form
          setLoading(false);
        }
      } catch (err) {
        console.error('Scan initialization failed:', err);
        toast.error('Invalid or inactive QR Code');
        setLoading(false);
      }
    };

    if (qrId) {
      initScan();
    }
  }, [qrId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const baseURL = 'https://retailer.avopay.pro:3000/api/v1';
      // Post again with the customer's actual mobile number to capture it!
      await axios.post(`${baseURL}/qr-codes/${qrId}/scan`, {
        mobile: mobile.trim(),
        store: 'Online Scan'
      });

      toast.success('Information submitted successfully! 🎉');
      setRedirecting(true);
      
      // Redirect after a brief success animation delay
      setTimeout(() => {
        window.location.href = qrDetails.url;
      }, 1200);
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Failed to submit. Redirecting you anyway...');
      setTimeout(() => {
        window.location.href = qrDetails?.url || 'https://retailer.avopay.pro';
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  // Sleek loading / redirecting screen
  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white selection:bg-amber-500/30">
        {/* Decorative ambient glowing circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          {/* Spinner */}
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-amber-500/30 animate-spin"
              style={{ animationDuration: '1.2s' }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">✨</span>
          </div>

          <h2 className="text-xl font-black tracking-tight mb-2">
            {redirecting ? 'Connecting you now...' : 'Processing QR Scan...'}
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
            {redirecting 
              ? `Redirecting you to ${qrDetails?.name || 'your destination'}...` 
              : 'Please wait while we verify your scan.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Capturing customer data screen
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white selection:bg-amber-500/30 relative overflow-hidden">
      {/* Dynamic background gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-up">
        {/* Welcome Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-950/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <span className="text-3xl font-black text-amber-500">c</span>
            </div>
          </div>
        </div>

        {/* Dynamic header text based on QR type */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {qrDetails?.type === 'loyalty' ? 'Join Loyalty Program' : 
             qrDetails?.type === 'birthday' ? 'Birthday Surprise Offer' : 
             qrDetails?.type === 'rewards_check' ? 'Check Your Rewards' :
             'Unlock Your Special Offer'}
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-[290px] mx-auto leading-relaxed">
            Enter your mobile number to instantly claim your rewards and proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mobile input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-sm font-bold text-slate-500">+91</span>
              </div>
              <input
                type="tel"
                pattern="[0-9]*"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit number"
                disabled={submitting || redirecting}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50 font-semibold tracking-wide"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || redirecting || mobile.length < 10}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-extrabold rounded-2xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wide"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Submitting...
              </span>
            ) : 'Claim & Proceed'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Powered by Cuben Retailer · Secure Redirection
          </p>
        </div>
      </div>
    </div>
  );
}
