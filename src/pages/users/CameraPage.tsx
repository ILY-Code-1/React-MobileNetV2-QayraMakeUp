import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Zap, Flashlight, Check, SwitchCamera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../store/authStore';
import { useAnalysisStore } from '../../store/analysisStore';
import { tfliteService } from '../../services/tfliteService';

const CameraPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const user = useAuthStore((state) => state.user);
  const addAnalysis = useAnalysisStore((state) => state.addAnalysis);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [, setIsCapturing] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMicEnabled, _] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Request camera permissions
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    startCamera();
    return () => {
      // Clean up camera stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log('Camera track stopped');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.srcObject = null;
      }
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

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto || !user) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Foto atau data user tidak tersedia.',
        confirmButtonColor: '#C68E2D',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Show loading
      Swal.fire({
        title: 'Menganalisis...',
        text: 'Mohon tunggu, sistem sedang memproses gambar Anda.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Run TFLite inference
      const inferenceResult = await tfliteService.analyzeImage(capturedPhoto);

      // Save to Firestore
      const newAnalysis = await addAnalysis({
        userId: user.id,
        name: user.name,
        email: user.email,
        eventDate: user.eventDate,
        imageUrl: capturedPhoto,
        result: inferenceResult.predictedLabelDisplay,
        modelOutputRaw: inferenceResult.modelOutputRaw,
        predictedLabel: inferenceResult.predictedLabel,
        confidenceScore: inferenceResult.confidenceScore,
        generatedSummary: inferenceResult.generatedSummary,
        clinicalNotes: inferenceResult.clinicalNotes,
        catatan_qayra: '',
      });

      // Close loading and show success
      Swal.fire({
        icon: 'success',
        title: 'Analisis Selesai!',
        text: 'Hasil analisis kulit wajah Anda telah tersimpan.',
        confirmButtonColor: '#C68E2D',
      }).then(() => {
        // Navigate to detail page
        navigate(`/riwayat/${newAnalysis.id}`);
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menganalisis',
        text: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses gambar. Silakan coba lagi.',
        confirmButtonColor: '#C68E2D',
      });
    } finally {
      setIsProcessing(false);
      setShowPhotoPreview(false);
      setCapturedPhoto(null);
    }
  };

  return (
    <div className="relative h-full bg-black">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#C68E2D] animate-spin mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Menganalisis...</p>
            <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}

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
                <SwitchCamera className="w-6 h-6" />
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
                {/* Capture Button - Main FAB */}
                {showPhotoPreview ? (
                  // Photo Preview Actions
                  <div className="flex items-center space-x-4">
                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirmPhoto}
                      className="w-14 h-14 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Confirm Photo"
                    >
                      <Check className="w-7 h-7" />
                    </button>

                    {/* Retake Button */}
                    <button
                      onClick={handleRetake}
                      className="w-14 h-14 bg-linear-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center text-white hover:from-gray-600 hover:to-gray-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Retake Photo"
                    >
                      <RotateCcw className="w-7 h-7" />
                    </button>
                  </div>
                ) : (
                  // Normal Capture Mode
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleUpload}
                      className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                      title="Upload Photo"
                    >
                      <Upload className="w-7 h-7" />
                    </button>
                    <button
                      onClick={handleCapture}
                      className="w-14 h-14 bg-linear-to-br from-[#C68E2D] to-[#B77E29] rounded-full flex items-center justify-center text-white hover:from-[#B77E29] hover:to-[#A68E19] shadow-2xl transform hover:scale-110 transition-all duration-200 ring-4 ring-white/50"
                      title="Capture Photo"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraPage;
