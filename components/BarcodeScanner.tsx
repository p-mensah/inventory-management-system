import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Scan, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [manualInput, setManualInput] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup: stop camera when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setScanning(true);
            }
        } catch (err) {
            setError('Unable to access camera. Please check permissions.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            onScan(manualInput.trim());
            onClose();
        }
    };

    // Simulated barcode detection (replace with actual library like quagga.js or zxing)
    const simulateScan = () => {
        const simulatedBarcode = Math.random().toString().slice(2, 15);
        onScan(simulatedBarcode);
        stopCamera();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Scan Barcode
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Camera View */}
                    {scanning ? (
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-64 bg-slate-900 rounded-xl object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-32 border-4 border-emerald-500 rounded-xl opacity-50" />
                            </div>

                            {/* Simulate Scan Button (for demo) */}
                            <button
                                onClick={simulateScan}
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 btn-gradient-primary px-6 py-2 rounded-xl text-white font-semibold shadow-lg"
                            >
                                Simulate Scan (Demo)
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Camera className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Click the button below to start camera
                            </p>
                            <button
                                onClick={startCamera}
                                className="btn-gradient-primary px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
                            >
                                <Camera className="w-5 h-5" />
                                Start Camera
                            </button>
                        </div>
                    )}

                    {/* Manual Input */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Or enter barcode manually:
                        </p>
                        <form onSubmit={handleManualSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                placeholder="Enter barcode number..."
                                className="input-modern flex-1 px-4 py-2.5 rounded-xl text-sm"
                            />
                            <button
                                type="submit"
                                className="btn-gradient-accent px-6 py-2.5 rounded-xl text-white font-semibold whitespace-nowrap"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
