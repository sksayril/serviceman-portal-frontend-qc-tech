import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface FormData {
  organizationName: string;
  productName: string;
  additionalInfo: string;
  remarks: string;
  machineName: string;
  machineManufacturer: string;
  machineSerialNumber: string;
  machineModel: string;
  contactPersonName: string;
  contactPersonMobileNumber: string;
  companyAddress: string;
  ticketNumber: string;
  customerDetails: string;
  jobStartedDateTime: string;
  jobClosedDateTime: string;
  images: string[];
}

const Home = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    productName: '',
    additionalInfo: '',
    remarks: '',
    machineName: '',
    machineManufacturer: '',
    machineSerialNumber: '',
    machineModel: '',
    contactPersonName: '',
    contactPersonMobileNumber: '',
    companyAddress: '',
    ticketNumber: '',
    customerDetails: '',
    jobStartedDateTime: '',
    jobClosedDateTime: '',
    images: [],
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  // Reset camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure camera view is properly initialized
  useEffect(() => {
    if (showCamera && videoRef.current && !videoRef.current.srcObject) {
      startCamera();
    }
  }, [showCamera]);

  const startCamera = async () => {
    setError('');
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
      setShowCamera(true);
    } catch (err) {
      setError('Failed to access camera. Please check camera permissions.');
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && images.length < 10 && isCameraReady) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImages(prev => [...prev, imageData]);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      organizationName: '',
      productName: '',
      additionalInfo: '',
      remarks: '',
      machineName: '',
      machineManufacturer: '',
      machineSerialNumber: '',
      machineModel: '',
      contactPersonName: '',
      contactPersonMobileNumber: '',
      companyAddress: '',
      ticketNumber: '',
      customerDetails: '',
      jobStartedDateTime: '',
      jobClosedDateTime: '',
      images: [],
    });
    setImages([]);
    setShowSuccess(false);
    setSubmissionId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const form = new FormData();
  
      // Add all form fields to the FormData object
      form.append('organizationName', formData.organizationName);
      form.append('productName', formData.productName);
      form.append('additionalInfo', formData.additionalInfo);
      form.append('remarks', formData.remarks);
      form.append('machineName', formData.machineName);
      form.append('machineManufacturer', formData.machineManufacturer);
      form.append('machineSerialNumber', formData.machineSerialNumber);
      form.append('machineModel', formData.machineModel);
      form.append('contactPersonName', formData.contactPersonName);
      form.append('contactPersonMobileNumber', formData.contactPersonMobileNumber);
      form.append('companyAddress', formData.companyAddress);
      form.append('ticketNumber', formData.ticketNumber);
      form.append('customerDetails', formData.customerDetails);
      form.append('jobStartedDateTime', formData.jobStartedDateTime);
      form.append('jobClosedDateTime', formData.jobClosedDateTime);
  
      // Convert base64 images to Blob and append
      images.forEach((image, index) => {
        const blob = dataURLtoBlob(image);
        const file = new File([blob], `image${index}.jpg`, { type: 'image/jpeg' });
        form.append('images', file);
      });
  
      const response = await fetch('http://localhost:3100/admin/api/serviceman/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ Don't set Content-Type! The browser will do it for multipart/form-data.
        },
        body: form,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Instead of alert, set success state and submission ID
        setSubmissionId(data.taskId || 'T-' + Date.now());
        setShowSuccess(true);
      } else {
        setError(data.message || 'Failed to submit task');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to convert base64 to Blob
  function dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
  
  if (showSuccess) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-bounce mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-center text-green-700 mb-4">Task Submitted Successfully!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full max-w-md">
            <p className="text-center text-green-800 mb-2">Your task has been submitted with ID:</p>
            <p className="text-lg font-bold text-center bg-white py-2 px-4 rounded border border-green-200 shadow-sm">
              {submissionId}
            </p>
          </div>
          <p className="text-gray-600 text-center mb-8">
            Thank you for your submission. Our team will process your request shortly.
            You can track the status of your task using the ID above.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 shadow-md transition-all duration-200"
            >
              Submit Another Task
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Submit New Task</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 shadow">
          <div className="flex">
            <div className="py-1"><svg className="w-6 h-6 mr-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg></div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Camera Capture</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">
                  Images: {images.length}/10
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={captureImage}
                    disabled={!isCameraReady || images.length >= 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name*</label>
            <input
              type="text"
              required
              value={formData.organizationName}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-blue-700 border-b border-gray-200 pb-2">Machine Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name*</label>
            <input
              type="text"
              required
              value={formData.machineName}
              onChange={(e) => setFormData(prev => ({ ...prev, machineName: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Manufacturer*</label>
            <input
              type="text"
              required
              value={formData.machineManufacturer}
              onChange={(e) => setFormData(prev => ({ ...prev, machineManufacturer: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Serial Number*</label>
            <input
              type="text"
              required
              value={formData.machineSerialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, machineSerialNumber: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Model*</label>
            <input
              type="text"
              required
              value={formData.machineModel}
              onChange={(e) => setFormData(prev => ({ ...prev, machineModel: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-blue-700 border-b border-gray-200 pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name*</label>
            <input
              type="text"
              required
              value={formData.contactPersonName}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPersonName: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Mobile Number*</label>
            <input
              type="tel"
              required
              value={formData.contactPersonMobileNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPersonMobileNumber: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Address*</label>
          <textarea
            required
            value={formData.companyAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <h3 className="text-lg font-semibold text-blue-700 border-b border-gray-200 pb-2">Job Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Number</label>
            <input
              type="text"
              value={formData.ticketNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, ticketNumber: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Details</label>
            <input
              type="text"
              value={formData.customerDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, customerDetails: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Started Date & Time</label>
            <input
              type="datetime-local"
              value={formData.jobStartedDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, jobStartedDateTime: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Closed Date & Time</label>
            <input
              type="datetime-local"
              value={formData.jobClosedDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, jobClosedDateTime: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info*</label>
          <textarea
            required
            value={formData.additionalInfo}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks*</label>
          <textarea
            required
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Images*
            </label>
            <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              {images.length}/10 Photos
            </span>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Captured ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {images.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 mb-4 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">No images added yet</p>
            </div>
          )}
          
          {images.length < 10 && (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none shadow-sm transition-all duration-200"
            >
              <Camera className="w-5 h-5 mr-2" />
              {images.length === 0 ? 'Take First Photo' : 'Add Another Photo'}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || images.length === 0}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Submitting...
            </>
          ) : (
            'Submit Task'
          )}
        </button>
      </form>
    </div>
  );
};

export default Home;