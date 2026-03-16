import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanFailure }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize scanner
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        html5QrcodeScanner.render((decodedText, decodedResult) => {
            // Clear scanner after successful scan
            html5QrcodeScanner.clear();
            if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        }, (errorMessage) => {
            if (onScanFailure) onScanFailure(errorMessage);
        });

        scannerRef.current = html5QrcodeScanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}></div>
    );
}
