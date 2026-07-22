import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  XMarkIcon, PlayIcon, ArrowRightIcon, ChevronDownIcon,
  ChevronUpIcon, ArrowDownTrayIcon, ShareIcon, QrCodeIcon,
  EyeIcon, PencilIcon, TrashIcon,
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
    let cancelled = false;
    QRCode.toDataURL(value || 'cuben-qr', {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: color, light: '#FFFFFF' },
    })
      .then(url => { if (!cancelled) setQrUrl(url); })
      .catch(() => { if (!cancelled) setQrUrl(''); });
    return () => { cancelled = true; };
  }, [value, size, color]);

  if (!qrUrl) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center bg-slate-50 rounded-xl">
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
      className="block rounded-xl border border-slate-100"
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
function DetailPanel({ obj, onClose, onCreateQR }) {
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

      {showQRModal && <QRCreateModal obj={obj} onClose={() => setShowQRModal(false)} />}
    </>
  );
}

// ─── QR Create Modal ──────────────────────────────────────────────────────────
function QRCreateModal({ obj, onClose }) {
  const [channel, setChannel] = useState('whatsapp');
  const [saved, setSaved] = useState(false);

  const handleCreate = async () => {
    try { await api.post('/qr-codes', { name: obj.title, type: obj.id, store: 'All Stores' }); } catch {}
    setSaved(true);
    toast.success('QR Code created! 🎉');
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <p className="text-sm font-bold text-slate-700">Your QR Code</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Channel tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
            {[
              { v: 'whatsapp', label: 'Via WhatsApp' },
              { v: 'landing', label: 'Via Cuben Retailer Landing Page' },
            ].map(t => (
              <button key={t.v} onClick={() => setChannel(t.v)}
                className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
                style={channel === t.v
                  ? { background: '#a89442', color: 'white', boxShadow: '0 1px 4px rgba(79,70,229,0.35)' }
                  : { color: '#64748b' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* QR Code display */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 ring-1 ring-slate-100">
              <QRCodeImage value={`${window.location.origin}/scan/${obj.id}?channel=${channel}`} size={168} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Powered by Cuben Retailer · cubenretailer.io</p>
          </div>

          {/* Scan instruction */}
          <div className="flex items-center gap-2 justify-center bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <span className="text-red-500 text-sm">📱</span>
            <p className="text-xs font-semibold text-red-600">Scan the QR code from your mobile.</p>
          </div>

          {/* CTA text */}
          <p className="text-base font-black text-slate-900 text-center leading-snug">
            Hey, try it yourself first<br />and experience it.
          </p>

          {/* Download / Share */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors">
              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors">
              <ShareIcon className="w-3.5 h-3.5" /> Share Link
            </button>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-3 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md"
            style={{ background: saved ? '#16a34a' : '#a89442' }}
          >
            {saved ? '✓ QR Created!' : <>Let's go <ArrowRightIcon className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Insights Tab ──────────────────────────────────────────────────────────
function QRInsightsTab() {
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchQRs = () => {
    setLoading(true);
    api.get('/qr-codes')
      .then(r => setQrs(r.data.qr_codes || []))
      .catch(() => setQrs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQRs(); }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/qr-codes/${deleting.qr_id}`);
      setQrs(prev => prev.filter(q => q.qr_id !== deleting.qr_id));
      toast.success('QR code deleted');
    } catch {
      toast.error('Failed to delete QR code');
    } finally {
      setDeleting(null);
    }
  };

  const totalScans = qrs.reduce((s, q) => s + (q.scans || 0), 0);
  const activeCount = qrs.filter(q => q.active !== false).length;
  const inactiveCount = qrs.length - activeCount;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total QR Codes', value: qrs.length, color: 'text-slate-900' },
          { label: 'Active QRs', value: activeCount, color: 'text-amber-600' },
          { label: 'Inactive QRs', value: inactiveCount, color: 'text-slate-500' },
          { label: 'Total Scans', value: totalScans.toLocaleString('en-IN'), color: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Your QR Codes</h3>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-50">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : qrs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
              <QrCodeIcon className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">No QR codes yet</p>
            <p className="text-xs text-slate-400 mt-1">Create a QR code from the QR Objectives tab to see it here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {qrs.map(qr => {
              const obj = QR_OBJECTIVES.find(o => o.id === qr.type);
              const isActive = qr.active !== false;
              return (
                <div key={qr.qr_id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                      <QRCodeImage value={qr.url || `${window.location.origin}/scan/${qr.qr_id}`} size={36} color="#a89442" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{qr.name}</p>
                      <p className="text-xs text-slate-400 truncate">{obj?.title || qr.type} · {qr.store || 'All Stores'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div className="hidden sm:block">
                      <p className="text-sm font-black text-slate-900">{(qr.scans || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-400">scans</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-cyan-50 text-amber-700 border border-cyan-200' : 'bg-slate-100 text-slate-500'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewing(qr)}
                        title="View QR code"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditing(qr)}
                        title="Modify QR code"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(qr)}
                        title="Delete QR code"
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewing && (
        <QRViewModal qr={viewing} onClose={() => setViewing(null)} onEdit={() => { const q = viewing; setViewing(null); setEditing(q); }} />
      )}
      {editing && (
        <QREditModal qr={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchQRs(); }} />
      )}
      {deleting && (
        <QRDeleteModal qr={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
}

// ─── QR View Modal ────────────────────────────────────────────────────────────
function QRViewModal({ qr, onClose, onEdit }) {
  const obj = QR_OBJECTIVES.find(o => o.id === qr.type);
  const isActive = qr.active !== false;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <p className="text-sm font-bold text-slate-700">QR Code Details</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 ring-1 ring-slate-100">
              <QRCodeImage value={qr.url || `${window.location.origin}/scan/${qr.qr_id}`} size={150} />
            </div>
            <p className="text-base font-black text-slate-900 text-center">{qr.name}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-cyan-50 text-amber-700 border border-cyan-200' : 'bg-slate-100 text-slate-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Type', value: obj?.title || qr.type },
              { label: 'Store', value: qr.store || 'All Stores' },
              { label: 'Total Scans', value: (qr.scans || 0).toLocaleString('en-IN') },
              { label: 'Destination', value: qr.url || '—' },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-slate-400 font-medium flex-shrink-0">{r.label}</span>
                <span className="text-slate-800 font-semibold text-right break-all">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Close
            </button>
            <button onClick={onEdit} className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-1.5" style={{ background: '#a89442' }}>
              <PencilIcon className="w-4 h-4" /> Modify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QR Edit Modal ────────────────────────────────────────────────────────────
function QREditModal({ qr, onClose, onSaved }) {
  const [name, setName] = useState(qr.name || '');
  const [store, setStore] = useState(qr.store || 'All Stores');
  const [url, setUrl] = useState(qr.url || '');
  const [active, setActive] = useState(qr.active !== false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await api.put(`/qr-codes/${qr.qr_id}`, { name: name.trim(), store, url, active });
      toast.success('QR code updated! ✅');
      onSaved();
    } catch {
      toast.error('Failed to update QR code');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">Modify QR Code</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">QR Name</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Store</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={store} onChange={e => setStore(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Destination URL</label>
            <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold text-slate-700">Active</span>
            <div onClick={() => setActive(v => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors ${active ? 'bg-cyan-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${active ? 'left-[22px]' : 'left-0.5'}`} />
            </div>
          </label>
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2" style={{ background: '#a89442' }}>
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QR Delete Confirmation ───────────────────────────────────────────────────
function QRDeleteModal({ qr, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Delete QR Code?</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            <span className="font-semibold text-slate-700">"{qr?.name || 'This QR code'}"</span> will be permanently removed. Existing prints will stop working.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QRCodePage() {
  const [activeTab, setActiveTab] = useState('objectives');
  const [selectedObj, setSelectedObj] = useState(null);

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
            <button className="inline-flex items-center gap-2 bg-white text-slate-800 text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-slate-50 transition-all">
              Tell me more <ChevronDownIcon className="w-4 h-4 text-slate-500" />
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
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={activeTab === tab.id
                ? { background: '#a89442', color: 'white', boxShadow: '0 1px 4px rgba(79,70,229,0.4)' }
                : { color: '#64748b' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
            See how QR works
            <span className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[9px] font-black">?</span>
          </button>
          <button
            onClick={() => setSelectedObj({ id: 'custom', title: 'Custom QR Code', desc: 'Build your own QR from scratch.', steps: ['Choose your QR type', 'Configure destination', 'Generate & download', 'Share with customers'], exampleImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=75' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 border border-slate-200 bg-white px-4 py-2 rounded-xl hover:border-cyan-500 hover:text-amber-800 hover:bg-cyan-50 transition-all shadow-sm"
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
              <button className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm w-fit shadow-md hover:shadow-lg">
                Share with us <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && <QRInsightsTab />}

      {activeTab === 'drafts' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
            <QrCodeIcon className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">No QR code drafts yet</p>
          <p className="text-sm text-slate-400 mb-6">Save a QR code as draft to find it here</p>
          <button
            onClick={() => setActiveTab('objectives')}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
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
          onCreateQR={() => {}}
        />
      )}
    </div>
  );
}


