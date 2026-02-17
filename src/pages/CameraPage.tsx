import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Upload, RotateCcw, Zap, X, Mic, MicOff, Flashlight, FlashlightOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Request camera permissions
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: isMicEnabled,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengakses kamera. Pastikan izin kamera diberikan.',
        confirmButtonColor: '#C68E2D',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setIsFrontCamera(!isFrontCamera);
    // Restart camera after short delay
    setTimeout(() => {
      setIsCameraActive(false);
      startCamera();
    }, 100);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const imageDataUrl = canvas.toDataURL('image/png');

        // Show preview
        setCapturedPhoto(imageDataUrl);
        setShowPhotoPreview(true);
        setIsCapturing(true);

        // Add flash effect
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-white z-50 transition-opacity duration-300';
        document.body.appendChild(flash);

        setTimeout(() => {
          flash.classList.add('opacity-0');
          setTimeout(() => flash.remove(), 300);
        }, 50);
      }
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedPhoto(e.target?.result as string);
          setShowPhotoPreview(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRetake = () => {
    setShowPhotoPreview(false);
    setCapturedPhoto(null);
    setIsCapturing(false);
    if (capturedPhoto) {
      setIsCameraActive(true);
      startCamera();
    }
  };

  const handleConfirmPhoto = () => {
    // In real app, upload photo to server
    Swal.fire({
      icon: 'success',
      title: 'Foto Berhasil!',
      text: 'Foto telah disimpan dan siap dianalisis.',
      confirmButtonColor: '#C68E2D',
    }).then(() => {
      setShowPhotoPreview(false);
      setCapturedPhoto(null);
      navigate('/riwayat');
    });
  };

  const handleDeletePhoto = () => {
    setShowPhotoPreview(false);
    setCapturedPhoto(null);
    setIsCapturing(false);
    setIsCameraActive(true);
  };

  return (
    <div className="relative h-full bg-black">
      {/* Video Container */}
      <div className="relative h-full">
        {/* Camera Feed */}
        {showPhotoPreview ? (
          // Photo Preview
          <div className="h-full flex items-center justify-center p-8 bg-black">
            <img
              src={capturedPhoto || ''}
              alt="Captured photo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          // Video Element
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
        )}

        {/* Canvas for capturing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Controls - Top Bar */}
        {!showPhotoPreview && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <div className="flex items-center space-x-2">
              {/* Switch Camera Button */}
              <button
                onClick={switchCamera}
                className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/30"
                title="Switch Camera"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              {/* Toggle Mic Button */}
              <button
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                className={`w-12 h-12 ${
                  isMicEnabled ? 'bg-[#C68E2D]' : 'bg-black/50 backdrop-blur-sm'
                } rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/30`}
                title={isMicEnabled ? 'Turn off mic' : 'Turn on mic'}
              >
                {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              {/* Toggle Flash Button */}
              <button
                onClick={() => setIsFlashOn(!isFlashOn)}
                className={`w-12 h-12 ${
                  isFlashOn ? 'bg-yellow-500' : 'bg-black/50 backdrop-blur-sm'
                } rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/30`}
                title={isFlashOn ? 'Turn off flash' : 'Turn on flash'}
              >
                {isFlashOn ? <Zap className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-white text-xs font-medium">
                {isCameraActive ? 'Camera Active' : 'Camera Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Camera Controls - Bottom (Like Flutter FAB Center Docked) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-20">
          <div className="flex items-center justify-center">
            {/* Floating Action Bar - Like Flutter */}
            <div className="bg-black/70 backdrop-blur-md rounded-3xl px-6 py-4 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-4">
                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                  title="Upload Photo"
                >
                  <Upload className="w-7 h-7" />
                </button>

                {/* Capture Button - Main FAB */}
                {showPhotoPreview ? (
                  // Photo Preview Actions
                  <div className="flex items-center space-x-4">
                    {/* Retake Button */}
                    <button
                      onClick={handleRetake}
                      className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center text-white hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Retake Photo"
                    >
                      <RotateCcw className="w-7 h-7" />
                    </button>

                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirmPhoto}
                      className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Confirm Photo"
                    >
                      <Camera className="w-7 h-7" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={handleDeletePhoto}
                      className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Delete Photo"
                    >
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                ) : (
                  // Normal Capture Mode
                  <button
                    onClick={handleCapture}
                    className="w-16 h-16 bg-gradient-to-br from-[#C68E2D] to-[#B77E29] rounded-full flex items-center justify-center text-white hover:from-[#B77E29] hover:to-[#A68E19] shadow-2xl transform hover:scale-110 transition-all duration-200 ring-4 ring-white/50"
                    title="Capture Photo"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                )}
              </div>
            </div>

            {/* Help Hint */}
            {!showPhotoPreview && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white font-medium whitespace-nowrap">
                Tap capture to take photo
              </div>
            )}
          </div>
        </div>

        {/* Camera Preview Thumbnail (in corner) */}
        {capturedPhoto && showPhotoPreview && (
          <div className="absolute bottom-28 left-4 w-16 h-16 border-2 border-white/30 rounded-lg overflow-hidden shadow-lg">
            <img
              src={capturedPhoto}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Camera Guide Frame */}
        {!showPhotoPreview && isCameraActive && (
          <div className="absolute top-20 bottom-32 left-8 right-8 pointer-events-none">
            {/* Face Guide Box */}
            <div className="border-2 border-[#C68E2D]/50 rounded-lg p-8 bg-black/10 backdrop-blur-sm">
              {/* Guide Circles */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border border-[#C68E2D]/30 rounded-full" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border border-[#C68E2D]/30 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border border-[#C68E2D]/30 rounded-full" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border border-[#C68E2D]/30 rounded-full" />
            </div>
          </div>
        )}

        {/* Camera Settings Panel */}
        {!showPhotoPreview && isCameraActive && (
          <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 z-30">
            <div className="flex flex-col space-y-3">
              <h4 className="text-white text-sm font-bold flex items-center">
                <CameraOff className="w-4 h-4 mr-2" />
                Camera Settings
              </h4>
              <div className="h-px bg-white/20" />
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-white/90">
                  <span>Resolution</span>
                  <span className="text-white">1280x720</span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span>Aspect Ratio</span>
                  <span className="text-white">16:9</span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span>Frame Rate</span>
                  <span className="text-white">30fps</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
