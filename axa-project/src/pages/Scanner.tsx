import { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ExtractedData {
  vendor: string;
  date: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
}

export function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'belum_lunas' | 'cicilan'>('lunas');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        setExtractedData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Tidak dapat mengakses kamera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setShowCamera(false);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const scanReceipt = async () => {
    if (!image) return;
    
    setLoading(true);
    
    // For development, simulate AI extraction
    // In production, this would call the OpenRouter API through the backend
    setTimeout(() => {
      const mockData: ExtractedData = {
        vendor: 'Toko Bangunan Jaya',
        date: new Date().toISOString().split('T')[0],
        items: [
          { description: 'Semen 50kg', quantity: 5, unitPrice: 65000, total: 325000 },
          { description: 'Pasir 1 Colt', quantity: 3, unitPrice: 150000, total: 450000 },
          { description: 'Batu Split', quantity: 2, unitPrice: 200000, total: 400000 },
        ],
        total: 1175000,
      };
      
      setExtractedData(mockData);
      setShowVerification(true);
      setLoading(false);
    }, 2000);
  };

  const saveTransaction = async () => {
    if (!extractedData || !selectedProject) {
      alert('Pilih proyek terlebih dahulu');
      return;
    }
    
    // In production, this would save to database
    alert(`Transaksi disimpan!\n\nVendor: ${extractedData.vendor}\nTotal: ${formatCurrency(extractedData.total)}\nStatus: ${paymentStatus}`);
    
    // Reset
    setImage(null);
    setExtractedData(null);
    setShowVerification(false);
    setPaymentStatus('lunas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">AI Scanner</h1>
        <p className="text-zinc-500 text-sm mt-1">Scan nota dengan AI untuk ekstraksi data otomatis</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left - Image Capture */}
        <div className="bg-surface-container-low p-6 rounded-lg">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Ambil Foto Nota</h3>
          
          {showCamera ? (
            <div className="relative">
              <video ref={videoRef} autoPlay className="w-full rounded-lg" />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={capturePhoto}
                  className="gold-gradient px-6 py-2 rounded-lg text-on-primary font-label"
                >
                  Ambil Foto
                </button>
                <button
                  onClick={() => { setShowCamera(false); stopCamera(); }}
                  className="bg-surface-container-highest px-6 py-2 rounded-lg text-zinc-400 font-label"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : image ? (
            <div className="relative">
              <img src={image} alt="Receipt" className="w-full rounded-lg" />
              <button
                onClick={() => { setImage(null); setExtractedData(null); }}
                className="absolute top-2 right-2 bg-surface-container-high p-2 rounded-full"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.76-.9l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.76.9l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-zinc-500 mb-4">Ambil foto atau upload nota</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface-container-highest px-4 py-2 rounded-lg text-on-surface font-label hover:bg-surface-container-high transition-colors"
                >
                  Upload File
                </button>
                <button
                  onClick={startCamera}
                  className="gold-gradient px-4 py-2 rounded-lg text-on-primary font-label"
                >
                  Buka Kamera
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {image && !showVerification && (
            <button
              onClick={scanReceipt}
              disabled={loading}
              className="w-full mt-4 gold-gradient py-3 rounded-lg text-on-primary font-label font-medium disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Scan Nota'}
            </button>
          )}
        </div>

        {/* Right - Verification */}
        <div className="bg-surface-container-low p-6 rounded-lg">
          <h3 className="font-headline font-semibold text-on-surface mb-4">Hasil Ekstraksi</h3>
          
          {showVerification && extractedData ? (
            <div className="space-y-4">
              {/* Vendor */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Vendor</label>
                <input
                  type="text"
                  value={extractedData.vendor}
                  onChange={(e) => setExtractedData(d => d ? { ...d, vendor: e.target.value } : null)}
                  className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => setExtractedData(d => d ? { ...d, date: e.target.value } : null)}
                  className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Item</label>
                <div className="space-y-2">
                  {extractedData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...extractedData.items];
                          newItems[idx].description = e.target.value;
                          setExtractedData(d => d ? { ...d, items: newItems } : null);
                        }}
                        className="flex-1 bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                        placeholder="Deskripsi"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...extractedData.items];
                          newItems[idx].quantity = parseFloat(e.target.value) || 0;
                          newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                          setExtractedData(d => d ? { ...d, items: newItems } : null);
                        }}
                        className="w-16 bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...extractedData.items];
                          newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                          newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                          setExtractedData(d => d ? { ...d, items: newItems } : null);
                        }}
                        className="w-24 bg-surface-container-highest px-3 py-2 rounded border border-outline-variant/15 text-on-surface text-sm"
                        placeholder="Harga"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-outline-variant/15">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-2xl font-headline font-bold text-primary">
                    {formatCurrency(extractedData.total)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-xs text-zinc-500 mb-2">Status Pembayaran</label>
                <div className="flex gap-2">
                  {(['lunas', 'belum_lunas', 'cicilan'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-label transition-colors ${
                        paymentStatus === status
                          ? status === 'lunas' ? 'bg-primary/20 text-primary'
                            : status === 'belum_lunas' ? 'bg-error/20 text-error'
                            : 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-surface-container-high text-zinc-400'
                      }`}
                    >
                      {status === 'lunas' ? 'Lunas' : status === 'belum_lunas' ? 'Belum Lunas' : 'Cicilan'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project & Vendor Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Proyek</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                  >
                    <option value="">Pilih Proyek...</option>
                    <option value="1">001 - Proyek A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Vendor</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 text-on-surface"
                  >
                    <option value="">Pilih Vendor...</option>
                    <option value="1">Toko Bangunan Jaya</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveTransaction}
                className="w-full gold-gradient py-3 rounded-lg text-on-primary font-label font-medium mt-4"
              >
                Simpan Transaksi
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Scan nota untuk melihat hasil</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}