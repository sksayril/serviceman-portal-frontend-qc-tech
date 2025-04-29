import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Phone, Shield, Building, Edit, Printer, X, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Import your company logo - you'll need to create an assets folder if you don't have one
import companyLogo from '/companylogo.png'; // Adjust path as needed

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const idCardRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(companyLogo); // Use imported logo as default

  useEffect(() => {
    // Load and cache the profile image when component mounts or when user changes
    if (user?.ImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Important for CORS
      
      img.onload = () => {
        setProfileImage(img.src);
        setImageLoaded(true);
      };
      
      img.onerror = () => {
        console.error("Failed to load profile image");
        setProfileImage(null);
        setImageLoaded(true); // Still mark as "loaded" so we show fallback
      };
      
      // Add cache-busting parameter if needed
      const cacheBuster = `?t=${new Date().getTime()}`;
      img.src = `${user.ImageUrl}${cacheBuster}`;
    } else {
      setImageLoaded(true); // No image to load
    }

    // Load company logo
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    
    logoImg.onload = () => {
      setLogoLoaded(true);
    };
    
    logoImg.onerror = () => {
      console.error("Failed to load company logo");
      setLogoLoaded(true); // Still mark as "loaded" so we show fallback
    };
    
    logoImg.src = companyLogoUrl;
  }, [user, companyLogoUrl]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrint = useReactToPrint({
    content: () => idCardRef.current,
    documentTitle: `ID_Card_${user.ServiceManId}`,
    onBeforePrint: () => {
      // Ensure images are fully loaded before printing
      const images = idCardRef.current.querySelectorAll('img');
      return new Promise(resolve => {
        let imagesLoaded = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        images.forEach(img => {
          if (img.complete) {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
          } else {
            img.onload = () => {
              imagesLoaded++;
              if (imagesLoaded === totalImages) resolve();
            };
            img.onerror = () => {
              imagesLoaded++;
              if (imagesLoaded === totalImages) resolve();
            };
          }
        });
      });
    },
    onAfterPrint: () => {
      console.log('ID Card printed successfully');
    },
  });

  const handlePreview = () => {
    setShowPreview(true);
  };

  const generatePDF = async () => {
    if (!idCardRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const frontCardElement = idCardRef.current.querySelector('.id-card-front');
      const backCardElement = idCardRef.current.querySelector('.id-card-back');
      
      // Create PDF with correct dimensions for standard ID card
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85, 54] // Standard ID card size in mm
      });
      
      // Helper function to convert HTML to canvas with proper image handling
      const convertToCanvas = async (element) => {
        // Temporarily make element visible if it's hidden
        const originalDisplay = element.style.display;
        element.style.display = 'block';
        
        // Wait for a moment to ensure any display changes have taken effect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capture with higher quality settings
        const canvas = await html2canvas(element, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000, // Longer timeout for image loading
          onclone: (clonedDoc) => {
            // Ensure images are properly loaded in the cloned document
            const images = clonedDoc.querySelectorAll('img');
            images.forEach(img => {
              img.crossOrigin = "anonymous";
              
              // Handle placeholder images differently
              if (img.src.includes('/api/placeholder/')) {
                // For placeholders, we can use a data URL directly to avoid CORS issues
                const canvas = document.createElement('canvas');
                canvas.width = img.width || 96;
                canvas.height = img.height || 96;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f3f4f6';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#9ca3af';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Photo', canvas.width / 2, canvas.height / 2);
                img.src = canvas.toDataURL();
              }
            });
          }
        });
        
        // Restore original display
        element.style.display = originalDisplay;
        
        return canvas;
      };
      
      // Capture front side with higher quality settings
      const frontCanvas = await convertToCanvas(frontCardElement);
      
      // Add front side image to PDF
      const frontImgData = frontCanvas.toDataURL('image/png');
      pdf.addImage(frontImgData, 'PNG', 0, 0, 85, 54);
      
      // Add new page for back side
      pdf.addPage([85, 54], 'landscape');
      
      // Capture back side with same high-quality settings
      const backCanvas = await convertToCanvas(backCardElement);
      
      // Add back side image to PDF
      const backImgData = backCanvas.toDataURL('image/png');
      pdf.addImage(backImgData, 'PNG', 0, 0, 85, 54);
      
      // Save the PDF with improved filename
      pdf.save(`QC_Tech_ID_Card_${user.ServiceManId}.pdf`);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Image rendering helper function
  const renderProfileImage = () => {
    if (!imageLoaded) {
      return <div className="animate-pulse bg-gray-200 w-full h-full"></div>;
    }
    
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={user.ServiceManName}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      );
    }
    
    return <User className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400" />;
  };
  
  // ID Card Image rendering function
  const renderIDCardImage = (size = 'medium') => {
    const sizeClasses = {
      small: "w-16 h-16",
      medium: "w-24 h-24", 
      large: "w-28 h-28 sm:w-32 sm:h-32"
    };
    
    if (!imageLoaded) {
      return <div className={`animate-pulse bg-gray-200 ${sizeClasses[size]}`}></div>;
    }
    
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt={user.ServiceManName}
          className={`object-cover ${sizeClasses[size]}`}
          crossOrigin="anonymous"
        />
      );
    }
    
    // Fallback if no user image
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-xs text-gray-500">Photo</div>
        </div>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <User className="w-10 h-10 text-gray-400" />
        </div>
      </div>
    );
  };

  // Company logo rendering function
  const renderCompanyLogo = () => {
    if (!logoLoaded) {
      return <div className="animate-pulse bg-gray-200 w-10 h-10"></div>;
    }
    
    return (
      <img
        src={companyLogoUrl}
        alt="QC Tech Service Logo"
        className="w-10 h-10 object-contain"
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section with Background */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-36 sm:h-48">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition duration-300 shadow-lg text-sm sm:text-base"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Logout
                </button>
              </div>
            </div>
            
            {/* Profile Image Overlay - Centered on mobile */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 sm:left-10 sm:translate-x-0">
              <div className="rounded-full border-4 border-white shadow-xl overflow-hidden">
                {/* Use the helper function for profile image */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  {renderProfileImage()}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 pb-8 px-4 sm:px-6 md:px-10">
            {/* User Name and Edit/Print Buttons - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 text-center sm:text-left">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.ServiceManName}</h1>
                <div className="flex items-center justify-center sm:justify-start mt-1">
                  <Shield className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-600 font-medium text-sm sm:text-base">Service ID: {user.ServiceManId}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition duration-200 w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button 
                  onClick={handlePreview}
                  className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition duration-200 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  ID Card
                </button>
              </div>
            </div>

            {/* Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 sm:p-6 shadow-sm border border-blue-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base break-all">{user.Email || "john@example.com"}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{user.ContactNumber || "9876543210"}</p>
                  </div>
                </div>
              </div>

              {/* Work Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 sm:p-6 shadow-sm border border-green-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-green-600" />
                  Work Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{user.BranchName || "Kolkata Branch"}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Service ID</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base break-all">{user.ServiceManId || "QC-T-25-2026-000000001"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-screen overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">ID Card Preview</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col items-center">
              <div className="id-card-container" ref={idCardRef}>
                {/* ID Card - Front Side - Updated design with company logo */}
                <div className="id-card-front relative w-full max-w-sm bg-white border border-gray-300 rounded-lg overflow-hidden mb-4">
                  {/* Header - Matching the blue color from the example */}
                  <div className="bg-blue-600 p-4 text-white flex items-center">
                    <div className="w-12 h-12 bg-white rounded-full mr-3 flex items-center justify-center">
                      {/* Company logo - Now using the dynamic rendering function */}
                      {renderCompanyLogo()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">QC TECH SERVICE</h2>
                      <p className="text-sm">Official ID Card</p>
                    </div>
                  </div>
                  
                  {/* Content - Matching layout from example image */}
                  <div className="p-4">
                    <div className="flex mb-3">
                      {/* Photo Section */}
                      <div className="mr-4">
                        <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {renderIDCardImage('medium')}
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-xs font-semibold bg-blue-600 text-white py-1 px-2 rounded">
                            Service Agent
                          </div>
                        </div>
                      </div>
                      
                      {/* Details Section - Matching style from example */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {user.ServiceManName || "John Doe"}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-gray-700">ID: {user.ServiceManId || "QC-T-25-2026-000000001"}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-gray-700">Branch: {user.BranchName || "Kolkata Branch"}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-gray-700">{user.ContactNumber || "9876543210"}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-gray-700 text-sm break-all">{user.Email || "john@example.com"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer - Matching layout from example */}
                  <div className="bg-blue-600 text-white text-sm p-3 text-center">
                    <p>This card is the property of the company. If found, please return.</p>
                  </div>
                </div>
                
                {/* ID Card - Back Side - Updated design with company logo */}
                <div className="id-card-back relative w-full max-w-sm bg-white border border-gray-300 rounded-lg overflow-hidden">
                  {/* Header with Company Logo */}
                  <div className="bg-blue-600 p-3 text-white flex items-center justify-between">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center ml-2">
                      {renderCompanyLogo()}
                    </div>
                    <h2 className="text-lg font-bold">TERMS AND CONDITIONS</h2>
                    <div className="w-8 h-8"></div> {/* Empty div for balance */}
                  </div>
                  
                  {/* Terms */}
                  <div className="p-4">
                    <ol className="text-sm space-y-2 list-decimal pl-5">
                      <li>This ID card must be worn visibly at all times while on duty.</li>
                      <li>This card is for official use only and is non-transferable.</li>
                      <li>Loss of this card should be reported immediately to HR department.</li>
                      <li>Misuse of this card will result in disciplinary action.</li>
                      <li>Upon termination of service, this card must be returned to the company.</li>
                    </ol>
                    
                    {/* QR Code - Enhanced with better positioning */}
                    <div className="absolute bottom-12 right-4">
                      <div className="w-20 h-20 border border-gray-300 flex items-center justify-center bg-white">
                        <div className="text-xs text-gray-400 text-center">QR Code</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 mb-4 flex space-x-4">
                {/* <button 
                  onClick={handlePrint}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print ID Card
                </button> */}
                
                <button 
                  onClick={generatePDF}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Save as PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles - Enhanced for better print quality */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .id-card-container, .id-card-container * {
            visibility: visible;
          }
          .id-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: 0;
            background-color: white;
          }
          .id-card-front, .id-card-back {
            page-break-after: always;
            box-shadow: none !important;
          }
          @page {
            size: 85mm 54mm landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;