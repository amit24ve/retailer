import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  XMarkIcon, PlayIcon, ArrowRightIcon, ChevronDownIcon,
  ChevronUpIcon, ArrowDownTrayIcon, ShareIcon, QrCodeIcon,
} from '@heroicons/react/24/outline';

// ─── QR Objective definitions ─────────────────────────────────────────────────
const QR_OBJECTIVES = [
  {
    id: 'acquire_biz',
    title: 'Acquire new customers from other businesses',
    desc: 'Place your QR on partner flyers and let customers scan to claim an exclusive offer.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=75',
    highlighted: false,
    steps: [
      'Create your QR Code.',
      'Print it and distribute it with a non-competitive partner.',
      'When the user scans it, they will be prompted to share their information in order to claim the offer.',
      'You have their information and are ready to retarget them.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=75',
    exampleBrand: "Levi's",
  },
  {
    id: 'business_card',
    title: 'Create smart business card to collect customer data',
    desc: 'Make a new customer with each card that you distribute by including a QR code on your business card.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=75',
    highlighted: true,
    steps: [
      'Print the QR code on your business card.',
      'When a contact scans it, they are taken to a sign-up form.',
      'Their details are automatically added to your customer list.',
      'Send them a welcome offer to convert them.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=75',
  },
  {
    id: 'events',
    title: 'Capture customers from events & bring them in-store',
    desc: 'Display your QR at events and trade shows to capture new customers instantly.',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=75',
    highlighted: false,
    steps: [
      'Generate a QR code with an event-specific offer.',
      'Display it at your booth or event space.',
      'Customers scan to claim the offer and register.',
      'Follow up with targeted campaigns post-event.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=75',
  },
  {
    id: 'social',
    title: 'Convert social media followers into customers',
    desc: 'Link your Instagram / Facebook page QR to drive online followers into your physical store.',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&q=75',
    highlighted: false,
    steps: [
      'Create a QR linking to your loyalty sign-up.',
      'Share it across your social media bios and posts.',
      'Followers scan to get an exclusive online-to-offline offer.',
      'They become registered loyalty members.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=75',
  },
  {
    id: 'newspaper',
    title: 'Get customers from newspaper Ad or outdoor Ad',
    desc: 'Place this QR code in your outdoors ad or newspaper ad and convert your viewers into customers.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&q=75',
    highlighted: true,
    steps: [
      'Design your print ad with the QR code prominently.',
      'Publish in your target newspaper or outdoor location.',
      'Readers scan and land on your offer/sign-up page.',
      'Retarget all scans with WhatsApp follow-ups.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=75',
  },
  {
    id: 'pamphlet',
    title: 'Create smart pamphlets to collect customer data',
    desc: 'Turn every pamphlet into a data collection tool with a scannable QR code.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=75',
    highlighted: false,
    steps: [
      'Design your pamphlet with an embedded QR code.',
      'Distribute at high-footfall areas.',
      'Customers scan to get a free product or discount.',
      'All scan data is captured in your dashboard.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=75',
  },
  {
    id: 'menu',
    title: 'Create QR code for menu, google review link, Instagram page',
    desc: 'One QR — multiple destinations. Direct customers wherever you need them.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=75',
    highlighted: false,
    steps: [
      'Choose your destination: menu, reviews or social.',
      'Generate a dynamic QR code.',
      'Place it on your table, counter or takeaway bag.',
      'Track scans and engagement in real time.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  },
  {
    id: 'birthday',
    title: "Collect customer's birthday and anniversary",
    desc: 'Use a birthday QR to enrich customer profiles and trigger automated celebration campaigns.',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500&q=75',
    highlighted: false,
    steps: [
      'Place the QR at checkout or on packaging.',
      'Customer scans and submits their birthday.',
      'Auto-campaign sends them a birthday offer.',
      'Boost repeat visits around celebrations.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=75',
  },
  {
    id: 'loyalty',
    title: 'Get new customers to join my loyalty program',
    desc: 'Place your loyalty QR everywhere — they scan, sign up, and start earning points instantly.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=75',
    highlighted: false,
    steps: [
      'Generate a loyalty sign-up QR code.',
      'Display it in-store, on receipts and packaging.',
      'Customer scans and instantly joins your program.',
      'They earn welcome points — hook them from day one.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=75',
  },
  {
    id: 'rewards_check',
    title: 'Get customers to see their loyalty points & rewards',
    desc: 'Let customers scan to instantly check their points balance and available rewards.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=75',
    highlighted: false,
    steps: [
      'Generate a "Check My Rewards" QR.',
      'Place it at the billing counter or on receipts.',
      'Customer scans to see their balance.',
      'They are more likely to redeem — increasing visits.',
    ],
    exampleImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=75',
  },
];

// ─── Real QR Code Image Component ─────────────────────────────────────────────
function QRCodeImage({ id, value = 'cuben-qr', size = 160, color = '#1e293b' }) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: color,
        light: '#FFFFFF'
      }
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [value, size, color]);

  if (!qrUrl) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center bg-slate-50 rounded-2xl">
        <span className="w-5 h-5 border-2 border-slate-300 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <img
      id={id}
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-xl shadow-sm border border-slate-100"
    />
  );
}

// ─── Objective Card — polished card with clean title-above, image-below layout ─
function ObjectiveCard({ obj, onClick }) {
  return (
    <div
      onClick={() => onClick(obj)}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl border"
      style={{ borderColor: obj.highlighted ? '#a89442' : '#f1f5f9' }}
    >
      {/* Title row */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: obj.highlighted ? 'linear-gradient(135deg, #f0fdfa, #ccfbf1)' : 'white' }}
      >
        <h3 className="text-sm font-bold text-slate-900 leading-snug">{obj.title}</h3>
        {!obj.highlighted && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{obj.desc}</p>
        )}
      </div>

      {/* Image — full bleed with overlay on highlighted */}
      <div className="relative overflow-hidden" style={{ height: 190 }}>
        <img
          src={obj.image}
          alt={obj.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay always present, stronger on highlighted */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            background: obj.highlighted
              ? 'linear-gradient(to top, rgba(13,110,110,0.92) 0%, rgba(13,110,110,0.2) 60%, transparent 100%)'
              : 'linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 55%)',
          }}
        />
        {/* Bottom CTA area */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          {obj.highlighted ? (
            <>
              <p className="text-xs text-white/90 font-medium leading-relaxed mb-2">{obj.desc}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-white/80">Create QR</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">Create QR</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Side Panel ────────────────────────────────────────────────────────
function DetailPanel({ obj, onClose, onSuccess }) {
  const [howOpen, setHowOpen] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-[380px] bg-white z-50 flex flex-col overflow-hidden"
        style={{ boxShadow: '-4px 0 40px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">QR Objective</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Example image */}
          <div className="px-5 pt-5">
            <p className="text-xs text-slate-500 mb-2.5">
              See examples of how{' '}
              <button className="text-amber-700 font-bold hover:underline">other brands use this QR</button>
            </p>
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 228 }}>
              <img src={obj.exampleImage || obj.image} alt="example" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Title + CTAs */}
          <div className="px-5 pt-4 pb-5">
            <h2 className="text-base font-black text-slate-900 leading-snug mb-4">{obj.title}</h2>
            <div className="flex items-center gap-2.5">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2 rounded-xl transition-colors">
                <PlayIcon className="w-3.5 h-3.5 text-slate-500" /> Learn more
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-cyan-300/60 hover:shadow-lg"
              >
                Create QR like this <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="px-5 pb-6">
            <button
              onClick={() => setHowOpen(v => !v)}
              className="w-full flex items-center justify-between py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl px-4 transition-colors"
            >
              <span className="text-sm font-bold text-slate-800">How it works?</span>
              {howOpen
                ? <ChevronUpIcon className="w-4 h-4 text-slate-400" />
                : <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              }
            </button>

            {howOpen && (
              <div className="mt-2.5 rounded-2xl border border-slate-200 overflow-hidden bg-white divide-y divide-slate-50">
                {obj.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 text-white"
                      style={{ background: '#a89442' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showQRModal && (
        <QRCreateModal 
          obj={obj} 
          onClose={() => setShowQRModal(false)} 
          onSuccess={() => {
            setShowQRModal(false);
            onSuccess?.();
          }} 
        />
      )}
    </>
  );
}

// ─── QR Create Modal ──────────────────────────────────────────────────────────
function QRCreateModal({ obj, onClose, onSuccess }) {
  const [channel, setChannel] = useState('whatsapp');
  const [whatsappPhone, setWhatsappPhone] = useState('919876543210');
  const [whatsappMessage, setWhatsappMessage] = useState(`Hi! I want to claim the "${obj.title}" offer.`);
  const [customUrl, setCustomUrl] = useState('https://retailer.avopay.pro');
  const [saved, setSaved] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sharingWA, setSharingWA] = useState(false);
  const [showWAShare, setShowWAShare] = useState(false);
  const [waSharePhone, setWaSharePhone] = useState('');

  // Construct the final destination URL based on the channel
  const destinationUrl = channel === 'whatsapp'
    ? `https://wa.me/${whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : customUrl;

  const handleCreate = async () => {
    setCreating(true);
    try { 
      await api.post('/qr-codes', { 
        name: obj.title, 
        type: obj.id, 
        store: 'All Stores',
        url: destinationUrl
      }); 
      setSaved(true);
      toast.success('QR Code created! 🎉');
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch {
      toast.error("Failed to create QR code");
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = () => {
    const imgEl = document.getElementById("qr-code-canvas");
    if (!imgEl) return;
    const url = imgEl.src;
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode_${obj.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded as PNG!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(destinationUrl)
      .then(() => {
        toast.success("Destination link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // Share QR link directly on WhatsApp Web / App
  const handleShareOnWhatsApp = () => {
    const msg = `🎯 *${obj.title}*\n\nScan or click this QR link to claim your offer:\n${destinationUrl}\n\n_Powered by Cuben Retailer_ 🚀`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    toast.success('Opening WhatsApp to share QR link!');
  };

  // Send QR link via Bonvoice API to a specific number
  const handleSendViaAPI = async () => {
    if (!waSharePhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    setSharingWA(true);
    try {
      const msg = `🎯 *${obj.title}*\n\nHere is your QR link:\n${destinationUrl}\n\n_Powered by Cuben Retailer_ 🚀`;
      const phone = waSharePhone.replace(/\D/g, '');
      const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
      await import('../services/api').then(({ default: api }) =>
        api.post('/whatsapp/send', { to: fullPhone, message: msg })
      );
      toast.success(`QR link sent to ${waSharePhone} on WhatsApp! ✅`);
      setShowWAShare(false);
      setWaSharePhone('');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to send via WhatsApp API');
    } finally {
      setSharingWA(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header - Fixed at the top */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-100 flex-shrink-0">
          <p className="text-sm font-bold text-slate-700">Your QR Code</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Channel tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full flex-shrink-0">
            {[
              { v: 'whatsapp', label: 'Via WhatsApp' },
              { v: 'landing', label: 'Via Cuben Retailer Landing Page' },
            ].map(t => (
              <button key={t.v} onClick={() => setChannel(t.v)}
                className="flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                style={channel === t.v
                  ? { background: '#a89442', color: 'white', boxShadow: '0 1px 4px rgba(79,70,229,0.35)' }
                  : { color: '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Destination Configuration Inputs */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-2.5">
            <p className="text-xs font-bold text-slate-800">Configure Destination Link</p>
            {channel === 'whatsapp' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="e.g., 919876543210"
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pre-filled Message</label>
                  <textarea
                    rows={2}
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    placeholder="Enter message..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Landing Page / Website URL</label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/menu"
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>
            )}
          </div>

          {/* QR Code display */}
          <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 ring-1 ring-slate-100">
              <QRCodeImage id="qr-code-canvas" value={destinationUrl} size={140} />
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Powered by Cuben Retailer · cubenretailer.io</p>
          </div>

          {/* Scan instruction */}
          <div className="flex items-center gap-2 justify-center bg-red-50 border border-red-100 rounded-xl px-3 py-1.5">
            <span className="text-red-500 text-sm">📱</span>
            <p className="text-[11px] font-semibold text-red-600">Scan the QR code from your mobile.</p>
          </div>

          {/* CTA text */}
          <p className="text-xs font-bold text-slate-500 text-center leading-normal">
            Try scanning it directly from the screen<br />to test your configuration!
          </p>

          {/* Download / Share / WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
            >
              <ShareIcon className="w-3.5 h-3.5" /> Copy Link
            </button>
          </div>

          {/* Share on WhatsApp — full-width green button */}
          <button
            onClick={handleShareOnWhatsApp}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-all cursor-pointer hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share QR on WhatsApp
          </button>

          {/* Send via API to specific number */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowWAShare(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span>📨 Send to specific number via WhatsApp API</span>
              <span className="text-slate-400">{showWAShare ? '▲' : '▼'}</span>
            </button>
            {showWAShare && (
              <div className="px-4 pb-3 space-y-2 bg-slate-50">
                <input
                  type="tel"
                  value={waSharePhone}
                  onChange={e => setWaSharePhone(e.target.value)}
                  placeholder="Phone number e.g. 9876543210"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400"
                />
                <button
                  onClick={handleSendViaAPI}
                  disabled={sharingWA || !waSharePhone.trim()}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  style={{ background: '#25D366' }}
                >
                  {sharingWA
                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : '📤 Send via WhatsApp API'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-3 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md cursor-pointer disabled:opacity-50"
            style={{ background: saved ? '#16a34a' : '#a89442' }}
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? '✓ QR Created!' : <>Let's go <ArrowRightIcon className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Insights Tab ──────────────────────────────────────────────────────────
function QRInsightsTab({ qrCodes = [], onToggleActive, onDelete }) {
  const totalScans = qrCodes.reduce((s, q) => s + (q.scans || 0), 0);
  const totalCustomers = qrCodes.reduce((s, q) => s + Math.round((q.scans || 0) * 0.15), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total QR Codes', value: qrCodes.length, color: 'text-slate-900' },
          { label: 'Active QRs', value: qrCodes.filter(q => q.active).length, color: 'text-amber-600' },
          { label: 'Total Scans', value: totalScans.toLocaleString('en-IN'), color: 'text-amber-700' },
          { label: 'Customers Captured', value: totalCustomers.toLocaleString('en-IN'), color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1.5`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Your QR Codes</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {qrCodes.map(qr => {
            const obj = QR_OBJECTIVES.find(o => o.id === qr.type);
            const customersCount = Math.round((qr.scans || 0) * 0.15);
            return (
              <div key={qr.qr_id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                    <QRCodeImage value={`${window.location.origin}/scan/${qr.qr_id}`} size={36} color="#a89442" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{qr.name}</p>
                    <p className="text-xs text-slate-400">{obj?.title || qr.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-black text-slate-900">{(qr.scans || 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400">scans</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-700">{customersCount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400">customers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onToggleActive(qr.qr_id, qr.active)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${qr.active ? 'bg-cyan-50 text-amber-700 border border-cyan-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                    >
                      {qr.active ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      onClick={() => onDelete(qr.qr_id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete QR"
                    >
                      <XMarkIcon className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {qrCodes.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">No QR codes found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState('objectives');
  const [selectedObj, setSelectedObj] = useState(null);
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQRs = async () => {
    try {
      const res = await api.get('/qr-codes');
      let qrList = res.data.qr_codes || [];
      if (qrList.length === 0) {
        // Seed some initial QR codes on the backend so the list isn't blank
        const initialSeeds = [
          { name: 'New Customer Acquisition', type: 'acquire_biz', store: 'All Stores' },
          { name: 'Business Card QR', type: 'business_card', store: 'All Stores' },
          { name: 'Loyalty Sign-up', type: 'loyalty', store: 'All Stores' },
          { name: 'Birthday Collection', type: 'birthday', store: 'All Stores' },
        ];
        for (const item of initialSeeds) {
          await api.post('/qr-codes', item);
        }
        // Fetch again
        const freshRes = await api.get('/qr-codes');
        qrList = freshRes.data.qr_codes || [];
      }
      setQrs(qrList);
    } catch (err) {
      toast.error("Failed to load QR codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const toggleQRActive = async (qr_id, currentStatus) => {
    try {
      await api.put(`/qr-codes/${qr_id}`, { active: !currentStatus });
      toast.success("QR Code status updated!");
      fetchQRs();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteQR = async (qr_id) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) return;
    try {
      await api.delete(`/qr-codes/${qr_id}`);
      toast.success("QR Code deleted successfully!");
      fetchQRs();
    } catch (err) {
      toast.error("Failed to delete QR code");
    }
  };

  return (
    <div className="pb-10 animate-slide-up">

      {/* ── Yellow Hero Banner ── */}
      <div
        className="rounded-3xl overflow-hidden mb-8 relative"
        style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 50%, #f59e0b 100%)' }}
      >
        <div className="flex flex-col xl:flex-row items-center min-h-[200px]">
          {/* Left text */}
          <div className="flex-1 px-8 py-9">
            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
              Scan, Collect, and Convert<br />
              through the Power of QR Codes!{' '}
              <span className="inline-block">⚡</span>
            </h1>
            <p className="text-sm text-amber-800/70 mb-5 max-w-sm leading-relaxed">
              Turn every customer touchpoint into a data opportunity. Print, share, and grow.
            </p>
            <button 
              onClick={() => setActiveTab('insights')}
              className="inline-flex items-center gap-2 bg-white text-slate-800 text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-slate-50 transition-all cursor-pointer"
            >
              See QR Insights <ArrowRightIcon className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Right — floating stat cards + illustration */}
          <div className="flex-shrink-0 px-8 py-6 flex items-end gap-5 xl:self-end">
            {/* Stat cards */}
            <div className="flex flex-col gap-2.5 mb-2">
              <div className="bg-white rounded-2xl px-5 py-3 shadow-xl border border-white/60">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">New Customers</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">1,987</p>
              </div>
              <div className="rounded-2xl px-5 py-3 shadow-xl" style={{ background: 'linear-gradient(135deg, #a89442, #c9b96e)' }}>
                <p className="text-[10px] font-semibold text-cyan-200 uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-black text-white mt-0.5">₹1,23,455</p>
              </div>
            </div>
            {/* Illustration */}
            <div className="w-32 h-40">
              <svg viewBox="0 0 130 170" className="w-full h-full" fill="none">
                <circle cx="65" cy="38" r="20" fill="#fca5a5" />
                <path d="M42 82 Q65 130 88 82" fill="#1e3a5f" />
                <rect x="40" y="78" width="50" height="60" rx="8" fill="#1e3a5f" />
                <path d="M40 92 Q18 104 20 122" stroke="#fca5a5" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M90 90 Q108 98 106 118" stroke="#fca5a5" strokeWidth="9" strokeLinecap="round" fill="none" />
                <rect x="95" y="108" width="22" height="34" rx="5" fill="#1e293b" />
                <rect x="97" y="111" width="18" height="26" rx="3" fill="#93c5fd" />
                <rect x="48" y="135" width="13" height="30" rx="6" fill="#1e3a5f" />
                <rect x="69" y="135" width="13" height="30" rx="6" fill="#1e3a5f" />
                <path d="M45 32 Q48 16 65 15 Q82 16 85 32" fill="#111827" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section heading ── */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Hello, what smart QR code do you want to create?</h2>
        <p className="text-sm text-slate-500 mt-1.5">Get new customers into your business, the smarter way. Create unlimited QR codes.</p>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
          {[
            { id: 'objectives', label: 'QR Objectives' },
            { id: 'insights', label: 'QR Insights' },
            { id: 'drafts', label: 'Drafts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
              style={activeTab === tab.id
                ? { background: '#a89442', color: 'white', boxShadow: '0 1px 4px rgba(79,70,229,0.4)' }
                : { color: '#64748b' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success("Scanning QR works by directing users to check-in forms or rewards page!")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            See how QR works
            <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[9px] font-black">?</span>
          </button>
          <button
            onClick={() => setSelectedObj({ id: 'custom', title: 'Custom QR Code', desc: 'Build your own QR from scratch.', steps: ['Choose your QR type', 'Configure destination', 'Generate & download', 'Share with customers'], exampleImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=75' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 border border-slate-200 bg-white px-4 py-2 rounded-xl hover:border-cyan-500 hover:text-amber-800 hover:bg-cyan-50 transition-all shadow-sm cursor-pointer"
          >
            Create from Scratch <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dashed separator */}
      <div className="border-t-2 border-dashed border-slate-100 mb-6" />

      {/* ── Tab content ── */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          {/* 3-col grid of all objectives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {QR_OBJECTIVES.map(obj => (
              <ObjectiveCard key={obj.id} obj={obj} onClick={setSelectedObj} />
            ))}
          </div>

          {/* "Using QR codes any other way?" section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-2">
            {/* Rewards check card */}
            <div
              className="rounded-2xl overflow-hidden border border-slate-100 bg-white hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedObj(QR_OBJECTIVES.find(o => o.id === 'rewards_check'))}
            >
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Get customers to see their loyalty points &amp; rewards
                </h3>
                <p className="text-xs text-slate-400 mt-1">Scan &amp; check rewards at the billing counter</p>
              </div>
              <div className="mx-4 mb-4 rounded-xl overflow-hidden relative" style={{ height: 168 }}>
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=75"
                  alt="rewards"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-bold text-white bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/30">
                    Tap to set up →
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback card */}
            <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-4">
                <QrCodeIcon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                Using QR codes<br />any other way?
              </h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                We would like to feature you and see how you're using it!
              </p>
              <button 
                onClick={() => toast.success("Thanks for sharing! We will get in touch soon.")}
                className="inline-flex items-center gap-2 bg-[#a89442] hover:bg-[#7d6d2f] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm w-fit shadow-md hover:shadow-lg cursor-pointer"
              >
                Share with us <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        loading ? (
          <div className="py-20 text-center">
            <span className="w-8 h-8 border-2 border-slate-300 border-t-[#a89442] rounded-full animate-spin inline-block" />
            <p className="text-xs text-slate-400 mt-2">Loading QR codes...</p>
          </div>
        ) : (
          <QRInsightsTab 
            qrCodes={qrs} 
            onToggleActive={toggleQRActive}
            onDelete={deleteQR}
          />
        )
      )}

      {activeTab === 'drafts' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
            <QrCodeIcon className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">No QR code drafts yet</p>
          <p className="text-sm text-slate-400 mb-6">Save a QR code as draft to find it here</p>
          <button
            onClick={() => setActiveTab('objectives')}
            className="inline-flex items-center gap-2 bg-[#a89442] hover:bg-[#7d6d2f] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Browse QR Objectives <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail panel */}
      {selectedObj && (
        <DetailPanel
          obj={selectedObj}
          onClose={() => setSelectedObj(null)}
          onSuccess={fetchQRs}
        />
      )}
    </div>
  );
}


