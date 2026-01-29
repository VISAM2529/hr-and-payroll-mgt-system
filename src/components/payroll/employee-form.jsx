"use client";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Briefcase,
  CreditCard,
  Save,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  DollarSign,
  Trash2,
  Eye,
  IdCard,
  CreditCard as Card,
  Car,
  Briefcase as Case,
  Banknote,
  UserCheck,
  Clock,
  Info,
  GraduationCap,
  Shield,
  FileWarning,
  BadgeDollarSign,
  Calculator,
  Percent,
  Plus,
  TrendingUp,
  Users,
  Download,
  MapPin,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// ==================== CLOUDINARY CONFIGURATION ====================
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "unifoods",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unifoods",
  folder: "employee-documents",
};

// ==================== VALIDATION UTILITIES ====================
const validators = {
  name: (v) => /^[A-Za-z\s]{1,40}$/.test(v?.trim() || ""),
  email: (v) => /^\S+@\S+\.\S+$/.test(v || ""),
  phone: (v) => /^[6-9]\d{9}$/.test(v?.replace(/\D/g, "") || ""),
  positiveNumber: (v) => /^\d+$/.test(v) && parseInt(v) > 0,
  accountNumber: (v) => /^\d{9,18}$/.test(v),
  ifsc: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test((v || "").toUpperCase()),
  pan: (v) =>
    /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/.test((v || "").toUpperCase()),
  aadhar: (v) => /^\d{12}$/.test(v),
  zip: (v) => !v || /^\d{6}$/.test(v),
};

// ==================== FORMATTING HELPERS ====================
const formatPhoneNumber = (value) => {
  const phone = value.replace(/\D/g, "");
  if (phone.length <= 3) return phone;
  if (phone.length <= 7) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7, 10)}`;
};

const formatPanNumber = (value) => {
  const pan = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (pan.length <= 5) return pan;
  if (pan.length <= 9) return `${pan.slice(0, 5)}${pan.slice(5)}`;
  return `${pan.slice(0, 5)}${pan.slice(5, 9)}${pan.slice(9, 10)}`;
};

const formatAadharNumber = (value) => {
  const aadhar = value.replace(/\D/g, "");
  if (aadhar.length <= 4) return aadhar;
  if (aadhar.length <= 8) return `${aadhar.slice(0, 4)} ${aadhar.slice(4)}`;
  return `${aadhar.slice(0, 4)} ${aadhar.slice(4, 8)} ${aadhar.slice(8, 12)}`;
};

// ==================== PT CALCULATION UTILITIES ====================
// Professional Tax is now entered directly by the user

// ==================== PF CALCULATION UTILITIES ====================
const calculatePF = (basicSalary, pfApplicable) => {
  if (pfApplicable !== "yes") return { employeePF: 0, employerPF: 0 };

  // Calculate PF on capped basic salary of 15000
  const pfBase = Math.min(basicSalary, 15000);

  // Employee contribution: 12% of capped basic salary
  const employeePF = (pfBase * 12) / 100;

  // Employer contribution: 13% of capped basic salary
  const employerPF = (pfBase * 13) / 100;

  return { employeePF, employerPF };
};

// ==================== SIMPLE SELECT COMPONENT ====================
function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  error,
  disabled = false,
}) {
  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white ${error
          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
          : "border-slate-300"
          } ${disabled ? "bg-slate-100 cursor-not-allowed" : ""} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ==================== DOCUMENT UPLOAD COMPONENT ====================
function DocumentUploadSection({
  uploadedFiles,
  onFilesChange,
  onFileRemove,
  employeeCategory = "",
  categoryId = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentCategories, setDocumentCategories] = useState([]);

  useEffect(() => {
    const fetchDocumentCategories = async () => {
      if (!categoryId) {
        setDocumentCategories([]);
        return;
      }
      try {
        setLoadingDocuments(true);
        const categoryResponse = await fetch(
          `/api/crm/employeecategory/${categoryId}`
        );
        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch category details");
        }

        const categoryData = await categoryResponse.json();

        if (
          !categoryData.category ||
          !categoryData.category.supportedDocuments
        ) {
          setDocumentCategories([]);
          return;
        }
        const transformedCategories =
          categoryData.category.supportedDocuments.map((doc, index) => {
            const getIcon = (docName) => {
              const lowerName = docName.toLowerCase();
              if (lowerName.includes("aadhar") || lowerName.includes("id"))
                return IdCard;
              if (lowerName.includes("pan")) return Card;
              if (lowerName.includes("bank") || lowerName.includes("passbook"))
                return Banknote;
              if (
                lowerName.includes("license") ||
                lowerName.includes("driving")
              )
                return Car;
              if (
                lowerName.includes("insurance") ||
                lowerName.includes("fitness")
              )
                return Shield;
              if (lowerName.includes("salary")) return DollarSign;
              if (
                lowerName.includes("experience") ||
                lowerName.includes("letter")
              )
                return Case;
              if (
                lowerName.includes("educational") ||
                lowerName.includes("certificate")
              )
                return GraduationCap;
              return FileText;
            };
            return {
              id: doc._id || `doc_${index}`,
              documentId: doc._id,
              name: doc.name,
              description: doc.description || `Upload ${doc.name}`,
              required: doc.isRequired || false,
              accept: ".pdf,.jpg,.jpeg,.png",
              maxFiles: doc.maxFiles || 2,
              icon: getIcon(doc.name),
            };
          });
        setDocumentCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching document categories:", error);
        toast.error("Failed to load document requirements");
        setDocumentCategories([]);
      } finally {
        setLoadingDocuments(false);
      }
    };
    fetchDocumentCategories();
  }, [categoryId]);

  useEffect(() => {
    const checkCloudinary = () => {
      if (typeof window !== "undefined" && window.cloudinary) {
        setCloudinaryReady(true);
      } else {
        setTimeout(checkCloudinary, 500);
      }
    };
    checkCloudinary();
  }, []);

  const uploadToCloudinary = (categoryId, category) => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.cloudinary) {
        toast.error(
          "Cloudinary upload system is not loaded. Please refresh the page and try again."
        );
        reject(new Error("Cloudinary not available"));
        return;
      }
      const currentCategoryFiles = uploadedFiles.filter(
        (file) => file.category === categoryId
      );
      if (currentCategoryFiles.length >= category.maxFiles) {
        toast.error(
          `Maximum ${category.maxFiles} files allowed for ${category.name}`
        );
        reject(new Error("File limit exceeded"));
        return;
      }
      setUploading(true);
      try {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            folder: `${CLOUDINARY_CONFIG.folder}/${employeeCategory || "general"
              }/${categoryId}`,
            sources: ["local", "camera"],
            multiple: true,
            maxFiles: category.maxFiles - currentCategoryFiles.length,
            clientAllowedFormats: ["pdf", "jpg", "jpeg", "png"],
            maxFileSize: 5000000,
            resourceType: "auto",
            showUploadMoreButton: true,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#F59E0B",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#F59E0B",
                action: "#F59E0B",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#F59E0B",
                complete: "#20B832",
                sourceBg: "#E4EBF1",
              },
            },
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              toast.error("Failed to upload file. Please try again.");
              setUploading(false);
              reject(error);
              return;
            }
            if (result.event === "success") {
              const newFile = {
                id: result.info.public_id,
                name: result.info.original_filename,
                type: result.info.format,
                size: result.info.bytes,
                category: categoryId,
                categoryName: category.name,
                uploadDate: new Date().toISOString(),
                url: result.info.secure_url,
                cloudinaryId: result.info.public_id,
                cloudinaryUrl: result.info.secure_url,
                thumbnail: result.info.thumbnail_url || result.info.secure_url,
              };
              onFilesChange([...uploadedFiles, newFile]);
            }
            if (result.event === "close") {
              setUploading(false);
              if (widget) {
                widget.close();
              }
              resolve();
            }
          }
        );
        widget.open();
      } catch (err) {
        console.error("Error creating Cloudinary upload widget:", err);
        toast.error(
          "Error initializing upload. Please refresh the page and try again."
        );
        setUploading(false);
        reject(err);
      }
    });
  };

  const handleUploadClick = (categoryId) => {
    if (!cloudinaryReady) {
      toast.error(
        "Upload system is still loading. Please wait a moment and try again."
      );
      return;
    }

    const category = documentCategories.find((cat) => cat.id === categoryId);
    if (!category) {
      toast.error("Document category not found");
      return;
    }

    setActiveCategory(categoryId);
    uploadToCloudinary(categoryId, category);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (
      fileType.includes("image") ||
      fileType.includes("jpg") ||
      fileType.includes("png") ||
      fileType.includes("jpeg")
    )
      return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFilesForCategory = (categoryId) => {
    return uploadedFiles.filter((file) => file.category === categoryId);
  };

  const removeFile = (fileId) => {
    onFileRemove(fileId);
  };

  const viewFile = (file) => {
    window.open(file.url, "_blank");
  };

  const getUploadStatus = (categoryId) => {
    const files = getFilesForCategory(categoryId);
    const category = documentCategories.find((cat) => cat.id === categoryId);
    if (!category)
      return { uploaded: 0, required: false, maxFiles: 1, isComplete: false };

    return {
      uploaded: files.length,
      required: category.required,
      maxFiles: category.maxFiles,
      isComplete: category.required ? files.length > 0 : true,
    };
  };

  const renderDocumentCard = (category) => {
    const IconComponent = category.icon;
    const status = getUploadStatus(category.id);
    const categoryFiles = getFilesForCategory(category.id);

    return (
      <div
        key={category.id}
        className={`border-2 rounded-xl p-4 transition-all ${category.required
          ? "border-blue-200 bg-blue-50 hover:border-blue-300"
          : "border-purple-200 bg-purple-50 hover:border-purple-300"
          }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.required ? "bg-blue-100" : "bg-purple-100"
                }`}
            >
              <IconComponent
                className={`w-5 h-5 ${category.required ? "text-blue-600" : "text-purple-600"
                  }`}
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                {category.name}
                {category.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {status.uploaded}/{category.maxFiles} files
                {category.required && (
                  <span className="text-blue-600 ml-2">Required</span>
                )}
              </p>
            </div>
          </div>
          {status.isComplete && (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-600 mb-3">{category.description}</p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleUploadClick(category.id)}
            disabled={
              uploading ||
              status.uploaded >= category.maxFiles ||
              !cloudinaryReady
            }
            className={`block w-full text-center px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${uploading ||
              status.uploaded >= category.maxFiles ||
              !cloudinaryReady
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : category.required
                ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                : "bg-purple-100 hover:bg-purple-200 text-purple-700"
              }`}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            {uploading && activeCategory === category.id
              ? "Uploading..."
              : !cloudinaryReady
                ? "Loading..."
                : "Add Files"}
          </button>
        </div>
        {categoryFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {categoryFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="text-sm">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => viewFile(file)}
                    className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="View file"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {!cloudinaryReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-yellow-800">Loading upload system...</p>
          </div>
        </div>
      )}
      {employeeCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Document requirements for:
                <span className="font-bold ml-1">{employeeCategory}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {loadingDocuments
                  ? "Loading document requirements..."
                  : documentCategories.length > 0
                    ? `${documentCategories.filter((doc) => doc.required).length
                    } required document(s) for this category`
                    : "No custom documents required for this category"}
              </p>
            </div>
          </div>
        </div>
      )}
      {loadingDocuments && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-2 border-slate-200 rounded-xl p-4 bg-white animate-pulse"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-full mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}
      {!loadingDocuments && documentCategories.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            Required Documents
            <span className="text-xs font-normal text-slate-500 ml-2">
              (For {employeeCategory} role)
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentCategories.map((category) => renderDocumentCard(category))}
          </div>
        </div>
      )}
      {!loadingDocuments && categoryId && documentCategories.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileWarning className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                No additional documents required
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Only basic verification documents (Aadhar, PAN, Bank) are
                required for this role.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PAYSLIP STRUCTURE SECTION COMPONENT ====================
function PayslipStructureSection({
  payslipStructure,
  onStructureChange,
  errors = {},
  employeeGender = "",
  pfApplicable = "",
  esicApplicable = "",
  tdsApplicable = "",
  isCompliant = false,
}) {
  // Auto-update PT deduction when gender or gross salary changes
  useEffect(() => {
    if (!isCompliant) return;

    // Calculate PT based on gender and gross
    const grossSalary = payslipStructure.grossSalary || 0;
    const isFemale = employeeGender?.toLowerCase() === 'female';

    let ptAmount = 0;
    if (isFemale) {
      // Female slabs
      if (grossSalary > 10000) ptAmount = 200;
    } else {
      // Male/Other slabs
      if (grossSalary > 10000) ptAmount = 200;
      else if (grossSalary > 7500) ptAmount = 175;
    }

    // Find and update PT deduction
    const ptIndex = payslipStructure.deductions.findIndex(
      d => d.name === "Professional Tax"
    );

    if (ptIndex !== -1) {
      const currentPT = payslipStructure.deductions[ptIndex].fixedAmount || 0;
      if (currentPT !== ptAmount) {
        const updatedDeductions = [...payslipStructure.deductions];
        updatedDeductions[ptIndex] = {
          ...updatedDeductions[ptIndex],
          fixedAmount: ptAmount,
        };
        onStructureChange({
          ...payslipStructure,
          deductions: updatedDeductions,
        });
      }
    }
  }, [employeeGender, payslipStructure.grossSalary, isCompliant]);
  // Add new earning component
  const addEarning = () => {
    const newEarning = {
      name: "New Earning",
      enabled: true,
      editable: true,
      calculationType: "percentage",
      percentage: 0,
      fixedAmount: 0,
    };

    onStructureChange({
      ...payslipStructure,
      earnings: [...payslipStructure.earnings, newEarning],
    });
  };

  // Add new deduction component
  const addDeduction = () => {
    const newDeduction = {
      name: "New Deduction",
      enabled: true,
      editable: true,
      calculationType: "percentage",
      percentage: 0,
      fixedAmount: 0,
    };

    onStructureChange({
      ...payslipStructure,
      deductions: [...payslipStructure.deductions, newDeduction],
    });
  };

  // Update earning
  const updateEarning = (index, field, value) => {
    const updatedEarnings = [...payslipStructure.earnings];
    updatedEarnings[index] = {
      ...updatedEarnings[index],
      [field]: value,
    };

    onStructureChange({
      ...payslipStructure,
      earnings: updatedEarnings,
    });
  };

  // Update deduction
  const updateDeduction = (index, field, value) => {
    const updatedDeductions = [...payslipStructure.deductions];
    updatedDeductions[index] = {
      ...updatedDeductions[index],
      [field]: value,
    };

    onStructureChange({
      ...payslipStructure,
      deductions: updatedDeductions,
    });
  };

  // Remove earning
  const removeEarning = (index) => {
    const updatedEarnings = payslipStructure.earnings.filter(
      (_, i) => i !== index
    );
    onStructureChange({
      ...payslipStructure,
      earnings: updatedEarnings,
    });
  };

  // Remove deduction
  const removeDeduction = (index) => {
    const updatedDeductions = payslipStructure.deductions.filter(
      (_, i) => i !== index
    );
    onStructureChange({
      ...payslipStructure,
      deductions: updatedDeductions,
    });
  };

  // Calculate PF contributions
  const calculatePF = () => {
    const basicSalary = parseFloat(payslipStructure.basicSalary) || 0;

    if (pfApplicable !== "yes") {
      return { employeePF: 0, employerPF: 0, totalPF: 0 };
    }

    let pfBase;

    if (esicApplicable === "yes") {
      // When ESIC is applicable, PF is calculated on Gross Wages (Basic + Earnings)
      const grossWages = calculateGrossWages();
      pfBase = grossWages;
    } else {
      // Standard PF calculation on capped Basic Salary (max 15000)
      pfBase = Math.min(basicSalary, 15000);
    }

    // Employee contribution: 12% of PF base
    const employeePF = Math.round((pfBase * 12) / 100);

    // Employer contribution: 13% of PF base
    const employerPF = Math.round((pfBase * 13) / 100);

    return {
      employeePF,
      employerPF,
      totalPF: employeePF + employerPF,
    };
  };

  // Calculate Professional Tax based on Maharashtra slabs (gender-based)
  // Male: Up to ₹7,500 = Nil, ₹7,501-10,000 = ₹175, Above ₹10,000 = ₹200
  // Female: Up to ₹10,000 = Nil, Above ₹10,000 = ₹200
  const calculatePTByGender = (grossSalary, gender) => {
    if (!isCompliant) return 0;

    const gross = parseFloat(grossSalary) || 0;
    const isFemale = gender?.toLowerCase() === 'female';

    if (isFemale) {
      // Female slabs
      if (gross <= 10000) return 0;
      return 200; // Above ₹10,000
    } else {
      // Male/Other slabs
      if (gross <= 7500) return 0;
      if (gross <= 10000) return 175;
      return 200; // Above ₹10,000
    }
  };

  // Calculate Professional Tax - uses the calculated amount based on gender and gross
  const calculatePT = () => {
    if (!isCompliant) return 0;
    const grossSalary = payslipStructure.grossSalary || calculateGrossWages();
    return calculatePTByGender(grossSalary, employeeGender);
  };

  // Calculate ESIC - Default 0.75% (Employee), or custom %
  const calculateESIC = (percentage = 0.75) => {
    if (esicApplicable !== "yes") return 0;

    // ESIC is calculated on Gross Wages (Basic + Allowances)
    const grossWages = calculateGrossWages();

    // Contribution: % of Gross Wages
    return Math.ceil(grossWages * (percentage / 100));
  };

  // Calculate earning amount
  const calculateEarningAmount = (earning) => {
    const basicSalary = parseFloat(payslipStructure.basicSalary) || 0;

    if (earning.calculationType === "fixed") {
      return earning.fixedAmount || 0;
    }

    if (earning.calculationType === "percentage") {
      return (basicSalary * (earning.percentage || 0)) / 100;
    }

    return 0;
  };

  // Calculate deduction amount
  const calculateDeductionAmount = (deduction) => {
    const basicSalary = parseFloat(payslipStructure.basicSalary) || 0;

    if (deduction.name === "Professional Tax") {
      return calculatePT();
    }

    if (deduction.name === "Provident Fund (Employee)") {
      return calculatePF().employeePF;
    }

    if (deduction.name === "Provident Fund (Employer)") {
      return calculatePF().employerPF;
    }

    if (deduction.name === "Employee State Insurance (ESIC)") {
      return calculateESIC(0.75);
    }

    if (deduction.name === "Employee State Insurance (ESIC) - Employer") {
      return calculateESIC(3.25);
    }

    if (deduction.calculationType === "fixed") {
      return deduction.fixedAmount || 0;
    }

    if (deduction.calculationType === "percentage") {
      return (basicSalary * (deduction.percentage || 0)) / 100;
    }

    return 0;
  };

  // Calculate Gross Wages (Basic + Allowances)
  const calculateGrossWages = () => {
    const basicSalary = parseFloat(payslipStructure.basicSalary) || 0;
    const additionalEarnings = payslipStructure.earnings
      .filter((e) => e.enabled)
      .reduce((sum, e) => sum + calculateEarningAmount(e), 0);

    return basicSalary + additionalEarnings;
  };

  // Calculate Total Earnings (CTC = Gross Salary entered by user)
  const calculateTotalEarnings = () => {
    // Return CTC (Gross Salary) as Total Earnings for display
    // This includes Basic + Allowances + Employer Contributions
    return parseFloat(payslipStructure.grossSalary) || calculateGrossWages();
  };

  // Calculate total deductions (Including Employer Components for display)
  const calculateTotalDeductions = () => {
    const { employeePF, employerPF } = calculatePF();
    const pt = calculatePT();
    const esicPart1 = calculateESIC(0.75); // Employee ESIC
    const esicPart2 = calculateESIC(3.25); // Employer ESIC

    const otherDeductions = payslipStructure.deductions
      .filter(
        (d) =>
          d.enabled &&
          d.name !== "Professional Tax" &&
          d.name !== "Provident Fund (Employee)" &&
          d.name !== "Provident Fund (Employer)" &&
          d.name !== "Employee State Insurance (ESIC)" &&
          d.name !== "Employee State Insurance (ESIC) - Employer"
      )
      .reduce((sum, d) => sum + calculateDeductionAmount(d), 0);

    // Include Employer PF and Employer ESIC in Total Deductions for summary display
    return employeePF + employerPF + pt + esicPart1 + esicPart2 + otherDeductions;
  };

  // Calculate net salary (CTC - Total Deductions)
  const calculateNetSalary = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  // Handle Gross Salary change - distribute difference between gross and basic to earnings
  // NEW LOGIC: Deduct PT, Employee PF, Employer PF from Gross first, then subtract Basic
  const handleGrossSalaryChange = (grossSalary) => {
    const basicSalary = parseFloat(payslipStructure.basicSalary) || 0;

    // 1. Calculate Deductions to subtract from Gross
    let ptDeduction = 0;
    let employeePF = 0;
    let employerPF = 0;

    // Professional Tax (fixed 200)
    if (isCompliant) {
      ptDeduction = 200;
    }

    // PF Calculations (on capped basic of 15000)
    if (pfApplicable === "yes") {
      const pfBase = Math.min(basicSalary, 15000);
      employeePF = Math.round((pfBase * 12) / 100);
      employerPF = Math.round((pfBase * 13) / 100);
    }

    // 2. Calculate Distributable Amount
    // Formula: Distributable = Gross - PT - EmployeePF - EmployerPF - BasicSalary
    const distributableAmount = grossSalary - ptDeduction - employeePF - employerPF - basicSalary;

    if (distributableAmount > 0 && payslipStructure.earnings.length > 0) {
      const enabledEarnings = payslipStructure.earnings.filter((e) => e.enabled);

      if (enabledEarnings.length > 0) {
        const updatedEarnings = [...payslipStructure.earnings];

        // Calculate total percentage weight for proportional distribution
        const totalPercentageWeight = enabledEarnings.reduce(
          (sum, e) => sum + (parseFloat(e.percentage) || 0),
          0
        );

        if (totalPercentageWeight > 0) {
          // Distribute based on percentage weights
          enabledEarnings.forEach((earning) => {
            const originalIndex = payslipStructure.earnings.findIndex(
              (e) => e.name === earning.name
            );
            if (originalIndex !== -1) {
              const weight = (parseFloat(earning.percentage) || 0) / totalPercentageWeight;
              const amount = distributableAmount * weight;
              updatedEarnings[originalIndex] = {
                ...updatedEarnings[originalIndex],
                calculationType: "fixed",
                fixedAmount: parseFloat(amount.toFixed(2)),
                percentage: parseFloat(earning.percentage) || 0,
              };
            }
          });
        } else {
          // If no percentages defined, distribute equally
          const perEarning = distributableAmount / enabledEarnings.length;
          enabledEarnings.forEach((earning) => {
            const originalIndex = payslipStructure.earnings.findIndex(
              (e) => e.name === earning.name
            );
            if (originalIndex !== -1) {
              updatedEarnings[originalIndex] = {
                ...updatedEarnings[originalIndex],
                calculationType: "fixed",
                fixedAmount: parseFloat(perEarning.toFixed(2)),
                percentage: 0,
              };
            }
          });
        }

        onStructureChange({
          ...payslipStructure,
          earnings: updatedEarnings,
          grossSalary: grossSalary,
        });
      }
    } else {
      // If gross is too low or no earnings, just update gross
      onStructureChange({
        ...payslipStructure,
        grossSalary: grossSalary,
      });
    }
  };

  // Handle Basic Salary change - recalculate earnings based on gross
  // NEW LOGIC: Same as handleGrossSalaryChange - deduct PT, PFs first
  const handleBasicSalaryChange = (basicSalary) => {
    const grossSalary = payslipStructure.grossSalary || 0;

    // 1. Calculate Deductions to subtract from Gross
    let ptDeduction = 0;
    let employeePF = 0;
    let employerPF = 0;

    // Professional Tax (fixed 200)
    if (isCompliant) {
      ptDeduction = 200;
    }

    // PF Calculations (on capped basic of 15000)
    if (pfApplicable === "yes") {
      const pfBase = Math.min(basicSalary, 15000);
      employeePF = Math.round((pfBase * 12) / 100);
      employerPF = Math.round((pfBase * 13) / 100);
    }

    // 2. Calculate Distributable Amount
    const distributableAmount = grossSalary - ptDeduction - employeePF - employerPF - basicSalary;

    if (distributableAmount > 0 && payslipStructure.earnings.length > 0) {
      const enabledEarnings = payslipStructure.earnings.filter(
        (e) => e.enabled
      );
      if (enabledEarnings.length > 0) {
        const updatedEarnings = [...payslipStructure.earnings];

        // Calculate total percentage weight for proportional distribution
        const totalPercentageWeight = enabledEarnings.reduce(
          (sum, e) => sum + (parseFloat(e.percentage) || 0),
          0
        );

        if (totalPercentageWeight > 0) {
          // Distribute based on percentage weights
          enabledEarnings.forEach((earning) => {
            const originalIndex = payslipStructure.earnings.findIndex(
              (e) => e.name === earning.name
            );
            if (originalIndex !== -1) {
              const weight = (parseFloat(earning.percentage) || 0) / totalPercentageWeight;
              const amount = distributableAmount * weight;
              updatedEarnings[originalIndex] = {
                ...updatedEarnings[originalIndex],
                calculationType: "fixed",
                fixedAmount: parseFloat(amount.toFixed(2)),
                percentage: parseFloat(earning.percentage) || 0,
              };
            }
          });
        } else {
          // If no percentages defined, distribute equally
          const perEarning = distributableAmount / enabledEarnings.length;
          enabledEarnings.forEach((earning) => {
            const originalIndex = payslipStructure.earnings.findIndex(
              (e) => e.name === earning.name
            );
            if (originalIndex !== -1) {
              updatedEarnings[originalIndex] = {
                ...updatedEarnings[originalIndex],
                calculationType: "fixed",
                fixedAmount: parseFloat(perEarning.toFixed(2)),
                percentage: 0,
              };
            }
          });
        }

        onStructureChange({
          ...payslipStructure,
          basicSalary: basicSalary,
          earnings: updatedEarnings,
        });
      }
    } else {
      // Just update basic salary
      onStructureChange({
        ...payslipStructure,
        basicSalary: basicSalary,
      });
    }
  };

  // Add PT deduction automatically if not present
  useEffect(() => {
    const ptIndex = payslipStructure.deductions.findIndex(
      (d) => d.name === "Professional Tax"
    );
    const hasPT = ptIndex !== -1;

    if (isCompliant) {
      if (!hasPT) {
        const ptDeduction = {
          name: "Professional Tax",
          enabled: true,
          editable: true,
          calculationType: "fixed",
          percentage: 0,
          fixedAmount: 200,
        };

        onStructureChange({
          ...payslipStructure,
          deductions: [...payslipStructure.deductions, ptDeduction],
        });
      } else if (payslipStructure.deductions[ptIndex].fixedAmount == 0) {
        // Default to 200 if not set (or equal to 0), but allow manual override (e.g., 300 for Feb)
        const updatedDeductions = [...payslipStructure.deductions];
        updatedDeductions[ptIndex] = {
          ...updatedDeductions[ptIndex],
          fixedAmount: 200,
        };
        onStructureChange({
          ...payslipStructure,
          deductions: updatedDeductions,
        });
      }
    } else {
      // If not compliant, set PT to 0
      if (hasPT && payslipStructure.deductions[ptIndex].fixedAmount !== 0) {
        const updatedDeductions = [...payslipStructure.deductions];
        updatedDeductions[ptIndex] = {
          ...updatedDeductions[ptIndex],
          fixedAmount: 0,
        };

        onStructureChange({
          ...payslipStructure,
          deductions: updatedDeductions,
        });
      }
    }
  }, [isCompliant, payslipStructure.deductions]);

  // Add PF deduction automatically if PF is applicable
  useEffect(() => {
    if (pfApplicable === "yes") {
      const hasEmployeePF = payslipStructure.deductions.some(
        (d) => d.name === "Provident Fund (Employee)"
      );
      if (!hasEmployeePF) {
        const pfDeduction = {
          name: "Provident Fund (Employee)",
          enabled: true,
          editable: false,
          calculationType: "percentage",
          percentage: 12,
          fixedAmount: 0,
        };

        onStructureChange({
          ...payslipStructure,
          deductions: [...payslipStructure.deductions, pfDeduction],
        });
      }
    }
  }, [pfApplicable]);



  // Add ESIC deduction automatically if ESIC is applicable
  useEffect(() => {
    if (esicApplicable === "yes") {
      let updatedDeductions = [...payslipStructure.deductions];
      let changed = false;

      // 1. Employee ESIC (0.75%)
      const hasESIC = updatedDeductions.some(d => d.name === "Employee State Insurance (ESIC)");
      if (!hasESIC) {
        updatedDeductions.push({
          name: "Employee State Insurance (ESIC)",
          enabled: true,
          editable: false,
          calculationType: "percentage",
          percentage: 0.75,
          fixedAmount: 0,
        });
        changed = true;
      }

      // 2. Employer ESIC (3.25%)
      const hasEmployerESIC = updatedDeductions.some(d => d.name === "Employee State Insurance (ESIC) - Employer");
      if (!hasEmployerESIC) {
        updatedDeductions.push({
          name: "Employee State Insurance (ESIC) - Employer",
          enabled: true,
          editable: false,
          calculationType: "percentage",
          percentage: 3.25,
          fixedAmount: 0,
        });
        changed = true;
      }

      if (changed) {
        onStructureChange({
          ...payslipStructure,
          deductions: updatedDeductions,
        });
      }
    } else {
      // Remove ESIC components if turned off
      let updatedDeductions = payslipStructure.deductions.filter(
        d => d.name !== "Employee State Insurance (ESIC)" &&
          d.name !== "Employee State Insurance (ESIC) - Employer"
      );

      if (updatedDeductions.length !== payslipStructure.deductions.length) {
        onStructureChange({
          ...payslipStructure,
          deductions: updatedDeductions,
        });
      }
    }
  }, [esicApplicable, payslipStructure.deductions]);

  // Ensure Employer PF is consistent (added if PF=Yes & ESIC=No, removed otherwise)
  // Also cleans up legacy "Provident Fund" if system one is active
  useEffect(() => {
    let updatedDeductions = [...payslipStructure.deductions];
    let changed = false;

    // Check for legacy "Provident Fund"
    const legacyPFIndex = updatedDeductions.findIndex(d => d.name === "Provident Fund");
    if (legacyPFIndex !== -1 && pfApplicable === "yes") {
      // If we are managing PF, we should remove the legacy/duplicate
      updatedDeductions = updatedDeductions.filter(d => d.name !== "Provident Fund");
      changed = true;
    }

    if (pfApplicable === "yes") {
      // Should have Employer PF regardless of ESIC status
      const hasEmployerPF = updatedDeductions.some(d => d.name === "Provident Fund (Employer)");
      if (!hasEmployerPF) {
        updatedDeductions.push({
          name: "Provident Fund (Employer)",
          enabled: true,
          editable: false,
          calculationType: "percentage",
          percentage: 13,
          fixedAmount: 0
        });
        changed = true;
      }
    } else {
      // Should NOT have Employer PF if PF is not applicable
      const initialCount = updatedDeductions.length;
      updatedDeductions = updatedDeductions.filter(d => d.name !== "Provident Fund (Employer)");
      if (updatedDeductions.length !== initialCount) {
        changed = true;
      }
    }

    if (changed) {
      onStructureChange({
        ...payslipStructure,
        deductions: updatedDeductions
      });
    }

  }, [pfApplicable, esicApplicable, payslipStructure.deductions]);

  // Add TDS deduction automatically if TDS is applicable
  useEffect(() => {
    if (tdsApplicable === "yes") {
      const hasTDS = payslipStructure.deductions.some(
        (d) => d.name === "Tax Deducted at Source (TDS)"
      );

      if (!hasTDS) {
        const tdsDeduction = {
          name: "Tax Deducted at Source (TDS)",
          enabled: true,
          editable: true,
          calculationType: "fixed",
          percentage: 0,
          fixedAmount: 0,
        };

        onStructureChange({
          ...payslipStructure,
          deductions: [...payslipStructure.deductions, tdsDeduction],
        });
      }
    }
  }, [tdsApplicable]);

  return (
    <div className="space-y-6">
      {/* Basic Salary Configuration */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Basic Salary Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Salary Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-lg transition-all hover:border-yellow-400 hover:bg-yellow-50 flex-1">
                <input
                  type="radio"
                  name="salaryType"
                  value="monthly"
                  checked={payslipStructure.salaryType === "monthly"}
                  onChange={(e) =>
                    onStructureChange({
                      ...payslipStructure,
                      salaryType: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Monthly Salary
                  </span>
                  <p className="text-xs text-slate-500">Fixed monthly amount</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-lg transition-all hover:border-yellow-400 hover:bg-yellow-50 flex-1">
                <input
                  type="radio"
                  name="salaryType"
                  value="perday"
                  checked={payslipStructure.salaryType === "perday"}
                  onChange={(e) =>
                    onStructureChange({
                      ...payslipStructure,
                      salaryType: e.target.value,
                    })
                  }
                  className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Per Day Salary
                  </span>
                  <p className="text-xs text-slate-500">Daily rate × days</p>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Basic Salary (₹) <span className="text-red-500">*</span>
              {payslipStructure.salaryType === "perday" && (
                <span className="text-xs text-slate-500 ml-2">
                  (Per Day Amount)
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                value={payslipStructure.basicSalary || ""}
                onChange={(e) =>
                  handleBasicSalaryChange(parseFloat(e.target.value) || 0)
                }
                placeholder={
                  payslipStructure.salaryType === "monthly" ? "50000" : "2000"
                }
                step="any"
                className={`w-full pl-8 pr-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["payslipStructure.basicSalary"]
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300"
                  }`}
              />
            </div>
            {errors["payslipStructure.basicSalary"] && (
              <div className="flex items-center space-x-1 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>{errors["payslipStructure.basicSalary"]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Gross Salary Input - Now Editable */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Gross Salary (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
              ₹
            </span>
            <input
              type="number"
              value={payslipStructure.grossSalary || ""}
              onChange={(e) =>
                handleGrossSalaryChange(parseFloat(e.target.value) || 0)
              }
              placeholder={
                payslipStructure.salaryType === "monthly" ? "60000" : "3000"
              }
              step="any"
              className={`w-full pl-8 pr-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors["payslipStructure.grossSalary"]
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-slate-300"
                }`}
            />
          </div>
          <p className="text-xs text-slate-500">
            Enter Gross Salary. The difference between Gross and Basic will be
            automatically distributed among earning components.
          </p>
        </div>
      </div>

      {/* Earnings Components */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BadgeDollarSign className="w-5 h-5 text-blue-600" />
            Earnings Components
            <span className="text-xs font-normal text-slate-500 ml-2">
              ({payslipStructure.earnings.filter((e) => e.enabled).length}{" "}
              enabled)
            </span>
          </h3>
          <button
            type="button"
            onClick={addEarning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Earning
          </button>
        </div>
        <div className="space-y-3">
          {payslipStructure.earnings.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <BadgeDollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">
                No earning components added yet
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Click "Add Earning" to create your first component
              </p>
            </div>
          ) : (
            payslipStructure.earnings.map((earning, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${earning.enabled
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={earning.enabled}
                      onChange={(e) =>
                        updateEarning(index, "enabled", e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={earning.name}
                      onChange={(e) =>
                        updateEarning(index, "name", e.target.value)
                      }
                      placeholder="Earning name"
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={earning.calculationType}
                      onChange={(e) =>
                        updateEarning(index, "calculationType", e.target.value)
                      }
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    {earning.calculationType === "percentage" ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={earning.percentage}
                          onChange={(e) =>
                            updateEarning(
                              index,
                              "percentage",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          step="any"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={earning.fixedAmount}
                          onChange={(e) =>
                            updateEarning(
                              index,
                              "fixedAmount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          step="any"
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      ₹
                      {calculateEarningAmount(earning).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {earning.editable && (
                      <button
                        type="button"
                        onClick={() => removeEarning(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove earning"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deductions Components */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-600" />
            Deductions Components
            <span className="text-xs font-normal text-slate-500 ml-2">
              ({payslipStructure.deductions.filter((d) => d.enabled).length}{" "}
              enabled)
            </span>
          </h3>
          <button
            type="button"
            onClick={addDeduction}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Deduction
          </button>
        </div>
        <div className="space-y-3">
          {payslipStructure.deductions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">
                No deduction components added yet
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Click "Add Deduction" to create your first component
              </p>
            </div>
          ) : (
            payslipStructure.deductions.map((deduction, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${deduction.enabled
                  ? "bg-red-50 border-red-200 shadow-sm"
                  : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={deduction.enabled}
                      onChange={(e) =>
                        updateDeduction(index, "enabled", e.target.checked)
                      }
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={deduction.name}
                      onChange={(e) =>
                        updateDeduction(index, "name", e.target.value)
                      }
                      placeholder="Deduction name"
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={deduction.calculationType}
                      onChange={(e) =>
                        updateDeduction(
                          index,
                          "calculationType",
                          e.target.value
                        )
                      }
                      disabled={
                        deduction.name === "Provident Fund (Employee)" ||
                        deduction.name === "Employee State Insurance (ESIC)"
                      }
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    {deduction.calculationType === "percentage" ? (
                      <div className="relative">
                        <input
                          type="number"
                          value={deduction.percentage}
                          onChange={(e) =>
                            updateDeduction(
                              index,
                              "percentage",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          step="any"
                          min="0"
                          max="100"
                          disabled={
                            deduction.name === "Provident Fund (Employee)" ||
                            deduction.name === "Employee State Insurance (ESIC)"
                          }
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={deduction.fixedAmount}
                          onChange={(e) =>
                            updateDeduction(
                              index,
                              "fixedAmount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          step="any"
                          min="0"
                          disabled={
                            deduction.name === "Provident Fund (Employee)" ||
                            deduction.name === "Employee State Insurance (ESIC)"
                          }
                          className="w-full pl-8 pr-3 py-2 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-700">
                      -₹
                      {calculateDeductionAmount(deduction).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 2 }
                      )}
                    </span>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {deduction.editable &&
                      deduction.name !== "Provident Fund (Employee)" &&
                      deduction.name !== "Employee State Insurance (ESIC)" && (
                        <button
                          type="button"
                          onClick={() => removeDeduction(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove deduction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
                {deduction.name === "Professional Tax" && (
                  <div className="mt-2 pt-2 border-t border-red-100">
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <Info className="w-3 h-3" />
                      <span>Professional Tax: ₹200/month (₹300 in February)</span>
                    </div>
                  </div>
                )}
                {deduction.name === "Provident Fund (Employee)" && (
                  <div className="mt-2 pt-2 border-t border-red-100">
                    <div className="flex items-center gap-2 text-xs text-red-600">
                      <Info className="w-3 h-3" />
                      <span>
                        Employee PF: 12% of Basic Salary • Employer PF: 13% of
                        Basic Salary
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Salary Breakdown Preview */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Salary Breakdown & Calculation Preview
          </h3>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Export Breakdown
          </button>
        </div>

        {/* Gross Salary Section */}
        <div className="bg-white rounded-xl p-5 border-2 border-green-200 shadow-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">
              Gross Salary (Total Earnings)
            </p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">
            ₹
            {calculateTotalEarnings().toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Basic Salary:</span>
              <span className="font-semibold">
                ₹
                {(payslipStructure.basicSalary || 0).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {payslipStructure.earnings
              .filter((e) => e.enabled)
              .map((earning, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm text-slate-600"
                >
                  <span className="text-slate-500">{earning.name}:</span>
                  <span className="font-semibold">
                    ₹
                    {calculateEarningAmount(earning).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Deductions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PF Breakdown */}
          {pfApplicable === "yes" && (
            <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600">
                  Provident Fund (PF) Breakdown
                </p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Employee PF (12%):</span>
                  <span className="font-semibold text-red-600">
                    -₹
                    {calculatePF().employeePF.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {esicApplicable !== "yes" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Employer PF (13%):</span>
                    <span className="font-semibold text-blue-600">
                      ₹
                      {calculatePF().employerPF.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200">
                  <span className="text-slate-700">Total PF Contribution:</span>
                  <span className="text-blue-700">
                    ₹
                    {calculatePF().totalPF.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ESIC Section */}
          {esicApplicable === "yes" && (
            <div className="bg-white rounded-xl p-5 border-2 border-indigo-200 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-600">
                  ESIC Contribution
                </p>
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Employee Part (0.75%):</span>
                  <span className="font-semibold text-red-600">
                    -₹{calculateESIC(0.75).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Employer Part (3.25%):</span>
                  <span className="font-semibold text-red-600">
                    -₹{calculateESIC(3.25).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-indigo-200">
                  <span className="text-indigo-700">Total ESIC (4%):</span>
                  <span className="text-red-700">
                    -₹{(calculateESIC(0.75) + calculateESIC(3.25)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Professional Tax Section */}
          <div className="bg-white rounded-xl p-5 border-2 border-red-200 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">
                Professional Tax (PT)
              </p>
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-red-600">
                    ₹{calculatePT().toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-500">
                    Applicable as per tax rules
                  </p>
                </div>
                {employeeGender === "Female" ? (
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                ) : employeeGender === "Male" ? (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Deductions */}
        {payslipStructure.deductions.filter(
          (d) =>
            d.enabled &&
            d.name !== "Professional Tax" &&
            d.name !== "Provident Fund (Employee)" &&
            d.name !== "Employee State Insurance (ESIC)" &&
            d.name !== "Employee State Insurance (ESIC) - Employer"
        ).length > 0 && (
            <div className="bg-white rounded-xl p-5 border-2 border-orange-200 shadow-md mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Other Deductions
              </h4>
              <div className="space-y-2">
                {payslipStructure.deductions
                  .filter(
                    (d) =>
                      d.enabled &&
                      d.name !== "Professional Tax" &&
                      d.name !== "Provident Fund (Employee)" &&
                      d.name !== "Employee State Insurance (ESIC)" &&
                      d.name !== "Employee State Insurance (ESIC) - Employer"
                  )
                  .map((deduction, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-slate-600"
                    >
                      <span>{deduction.name}:</span>
                      <span className="font-semibold text-red-600">
                        -₹
                        {calculateDeductionAmount(deduction).toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Net Salary Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-blue-100">
                Total Earnings
              </p>
              <p className="text-2xl font-bold mt-1">
                ₹
                {calculateTotalEarnings().toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">
                Total Deductions
              </p>
              <p className="text-2xl font-bold mt-1 text-red-200">
                -₹
                {calculateTotalDeductions().toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                Includes: PF{" "}
                {calculatePF().employeePF > 0
                  ? `(₹${calculatePF().employeePF.toLocaleString("en-IN")})`
                  : ""}
                , PT{" "}
                {calculatePT() > 0
                  ? `(₹${calculatePT().toLocaleString("en-IN")})`
                  : ""}
                {esicApplicable === "yes" && (
                  <>
                    , ESIC (₹
                    {(
                      calculateESIC(0.75) + calculateESIC(3.25)
                    ).toLocaleString("en-IN")}
                    )
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">
                Net Payable Salary
              </p>
              <p className="text-3xl font-bold mt-1">
                ₹
                {calculateNetSalary().toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-blue-200 mt-1">
                Take home amount
                {payslipStructure.salaryType === "perday" && " (per day)"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full ${calculateNetSalary() > 0 ? "bg-green-400" : "bg-red-400"
                  }`}
              ></div>
              <span>
                {calculateNetSalary() > 0
                  ? "Positive balance - Ready for processing"
                  : "Needs adjustment - Deductions exceed earnings"}
              </span>
            </div>
          </div>
        </div>

        {/* Per Day Salary Note */}
        {payslipStructure.salaryType === "perday" && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Per Day Salary Configuration
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  The amounts shown above are for one working day. Actual
                  monthly salary will be calculated by multiplying these amounts
                  with the number of working days in the month.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {[22, 24, 26, 30].map((days) => (
                    <div
                      key={days}
                      className="bg-white p-3 rounded-lg border border-yellow-200"
                    >
                      <p className="text-xs text-yellow-800">
                        For {days} days:
                      </p>
                      <p className="text-sm font-bold text-yellow-700">
                        ₹
                        {(calculateNetSalary() * days).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DROPDOWN OPTIONS ====================
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Suspended", label: "Suspended" },
  { value: "Terminated", label: "Terminated" },
];

const employmentTypeOptions = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Intern", label: "Intern" },
];

export default function EmployeeForm({ employeeData, isEdit = false }) {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  // State for dynamic dropdowns
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [formData, setFormData] = useState({
    personalDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      dateOfJoining: "",
      dateOfBirth: "",
      gender: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        address: "", // NEW
      },
      bloodGroup: "", // NEW
      currentAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      permanentAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
    },
    // NEW FIELDS
    password: "",
    confirmPassword: "",
    role: "employee",
    isCompliant: false,
    isTDSApplicable: false,

    jobDetails: {
      department: "",
      departmentId: "",
      organization: "",
      organizationId: "",
      employeeType: "",
      employeeTypeId: "",
      category: "",
      categoryId: "",
      teamLead: "",
    },
    salaryDetails: {
      // Basic salary removed from here - now managed in payslipStructure
      bankAccount: {
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        branch: "",
      },
      panNumber: "",
      aadharNumber: "",
    },
    payslipStructure: {
      salaryType: "monthly",
      basicSalary: 0,
      grossSalary: 0,
      earnings: [
        {
          name: "House Rent Allowance",
          enabled: true,
          editable: true,
          calculationType: "percentage",
          percentage: 50,
          fixedAmount: 0,
        },
        {
          name: "Transport Allowance",
          enabled: true,
          editable: true,
          calculationType: "percentage",
          percentage: 50,
          fixedAmount: 0,
        },
      ],
      deductions: [
        {
          name: "Provident Fund",
          enabled: true,
          editable: true,
          calculationType: "percentage",
          percentage: 13,
          fixedAmount: 0,
        },
        {
          name: "Professional Tax",
          enabled: true,
          editable: true,
          calculationType: "fixed",
          percentage: 0,
          fixedAmount: 200,
        },
      ],
      additionalFields: [
        { name: "Bank Account Number", enabled: true },
        { name: "PAN Number", enabled: true },
        { name: "UAN Number", enabled: true },
        { name: "Working Days", enabled: true },
      ],
    },
    probation: "no",
    isAttending: "no",
    attendanceApproval: {
      required: "no",
      shift1Supervisor: "",
      shift2Supervisor: "",
    },
    status: "Active",
    workingHr: "",
    otApplicable: "",
    esicApplicable: "",
    pfApplicable: "",
    isCompliant: false,
  });

  // File handling functions
  const handleFilesChange = (newFiles) => {
    setUploadedFiles(newFiles);
  };

  const handleFileRemove = (fileId) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));
  };

  // Fetch functions
  const fetchOrganizations = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch("/api/crm/organizations?limit=1000");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organizations");
      }
      const organizationOptions = data.organizations.map((org) => ({
        value: org._id,
        label: org.name,
        orgId: org.orgId,
      }));

      setOrganizations(organizationOptions);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchDepartments = async (organizationId) => {
    try {
      if (!organizationId) {
        setDepartments([]);
        setEmployeeTypes([]);
        setCategories([]);
        return;
      }
      const response = await fetch(
        `/api/crm/departments?organizationId=${organizationId}&limit=1000`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch departments");
      }
      const departmentOptions = data.data
        .filter((dept) => dept.status === "Active")
        .map((dept) => ({
          value: dept._id,
          label: dept.departmentName,
          name: dept.departmentName,
        }));

      setDepartments(departmentOptions);

      setFormData((prev) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          department: "",
          departmentId: "",
        },
        employeeType: "",
        category: "",
      }));
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchEmployeeTypes = async (organizationId, departmentId) => {
    try {
      if (!organizationId || !departmentId) {
        setEmployeeTypes([]);
        setCategories([]);
        return;
      }
      const params = new URLSearchParams();
      params.set("organizationId", organizationId);
      params.set("departmentId", departmentId);
      params.set("limit", "1000");
      const response = await fetch(
        `/api/crm/employeetype?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employee types");
      }
      const employeeTypeOptions = data.data.map((item) => ({
        value: item._id,
        label: item.employeeType,
        typeName: item.employeeType,
      }));

      setEmployeeTypes(employeeTypeOptions);

      setFormData((prev) => ({
        ...prev,
        employeeType: "",
        employeeTypeId: "",
        category: "",
        categoryId: "",
      }));
    } catch (error) {
      console.error("Error fetching employee types:", error);
      setEmployeeTypes([]);
    }
  };

  const fetchCategories = async (
    organizationId,
    departmentId,
    employeeTypeId
  ) => {
    try {
      if (!organizationId || !departmentId || !employeeTypeId) {
        setCategories([]);
        return;
      }

      const params = new URLSearchParams();
      params.set("organizationId", organizationId);
      params.set("departmentId", departmentId);
      params.set("employeeTypeId", employeeTypeId);
      params.set("limit", "1000");
      const response = await fetch(
        `/api/crm/employeecategory?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }
      const categoryOptions = data.data.map((item) => ({
        value: item._id,
        label: item.employeeCategory,
        categoryName: item.employeeCategory,
      }));

      setCategories(categoryOptions);

      setFormData((prev) => ({
        ...prev,
        category: "",
        categoryId: "",
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchSupervisors = async (organizationId) => {
    try {
      if (!organizationId) {
        setAvailableSupervisors([]);
        return;
      }
      setLoadingSupervisors(true);
      const response = await fetch(
        `/api/payroll/employees?organizationId=${organizationId}&status=Active&limit=1000`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch supervisors");
      }
      const supervisorOptions = data.employees
        .filter((emp) => emp._id !== employeeData?._id)
        .map((emp) => ({
          value: emp._id,
          label: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName} (${emp.employeeId})`,
        }));

      setAvailableSupervisors(supervisorOptions);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      setAvailableSupervisors([]);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Cascade fetches
  useEffect(() => {
    if (formData.jobDetails.organizationId) {
      fetchDepartments(formData.jobDetails.organizationId);
      fetchSupervisors(formData.jobDetails.organizationId);
    } else {
      setDepartments([]);
      setEmployeeTypes([]);
      setCategories([]);
      setTeamLeads([]);
      setAvailableSupervisors([]);
    }
  }, [formData.jobDetails.organizationId]);

  useEffect(() => {
    if (
      formData.jobDetails.organizationId &&
      formData.jobDetails.departmentId
    ) {
      fetchEmployeeTypes(
        formData.jobDetails.organizationId,
        formData.jobDetails.departmentId
      );
    } else {
      setEmployeeTypes([]);
      setCategories([]);
    }
  }, [formData.jobDetails.organizationId, formData.jobDetails.departmentId]);

  useEffect(() => {
    if (
      formData.jobDetails.organizationId &&
      formData.jobDetails.departmentId &&
      formData.jobDetails.employeeTypeId
    ) {
      fetchCategories(
        formData.jobDetails.organizationId,
        formData.jobDetails.departmentId,
        formData.jobDetails.employeeTypeId
      );
      if (formData.jobDetails.category?.toLowerCase() !== "team lead") {
        fetchTeamLeads(
          formData.jobDetails.organizationId,
          formData.jobDetails.departmentId,
          formData.jobDetails.categoryId,
          employeeData?._id
        );
      }
    } else {
      setCategories([]);
    }
  }, [
    formData.jobDetails.organizationId,
    formData.jobDetails.departmentId,
    formData.jobDetails.employeeTypeId,
  ]);

  // Load existing employee data in edit mode
  useEffect(() => {
    if (employeeData && isEdit) {
      setFormData(employeeData);
      if (employeeData.documents) {
        setUploadedFiles(employeeData.documents);
      }

      // Trigger cascade loading for edit mode
      if (employeeData.jobDetails?.organizationId) {
        fetchDepartments(employeeData.jobDetails.organizationId);
        fetchSupervisors(employeeData.jobDetails.organizationId);

        if (employeeData.jobDetails?.departmentId) {
          fetchEmployeeTypes(
            employeeData.jobDetails.organizationId,
            employeeData.jobDetails.departmentId
          );

          if (employeeData.jobDetails.employeeTypeId) {
            fetchCategories(
              employeeData.jobDetails.organizationId,
              employeeData.jobDetails.departmentId,
              employeeData.jobDetails.employeeTypeId
            ).then(() => {
              if (employeeData.jobDetails.category?.toLowerCase() !== "team lead") {
                fetchTeamLeads(
                  employeeData.jobDetails.organizationId,
                  employeeData.jobDetails.departmentId,
                  employeeData?._id
                );
              }
            });
          }
        }
      }
    }
  }, [employeeData, isEdit]);

  // Remove the useEffect that syncs basic salary between salaryDetails and payslipStructure
  // since basic salary is no longer in salaryDetails

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    let formattedValue = value;
    if (name === "personalDetails.phone") {
      formattedValue = formatPhoneNumber(value);
    }
    if (name === "salaryDetails.panNumber") {
      formattedValue = formatPanNumber(value);
    }
    if (name === "salaryDetails.aadharNumber") {
      formattedValue = formatAadharNumber(value);
    }
    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");
      if (subChild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: formattedValue,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: formattedValue,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const fetchTeamLeads = async (organizationId, departmentId, categoryId, currentEmployeeId = null) => {
    try {
      if (!organizationId || !departmentId) {
        setTeamLeads([]);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.set("organizationId", organizationId);
      params.set("departmentId", departmentId);
      params.set("categoryId", categoryId); // Filter by category
      params.set("status", "Active"); // Only active employees
      params.set("limit", "1000");

      const response = await fetch(`/api/payroll/employees?${params.toString()}`);
      const data = await response.json();

      const teamLeadEmp = data.employees.filter(emp => emp.jobDetails.category === "Team Lead");

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch team leads");
      }

      // Filter out current employee if in edit mode
      const filteredEmployees = teamLeadEmp.filter(
        emp => emp._id !== currentEmployeeId
      );

      const teamLeadOptions = filteredEmployees.map((emp) => ({
        value: emp._id,
        label: `${emp.personalDetails.firstName} ${emp.personalDetails.lastName} (${emp.employeeId || 'EMP'})`,
        employeeId: emp.employeeId,
      }));

      setTeamLeads(teamLeadOptions);

      // If no team leads found, clear the selection
      if (teamLeadOptions.length === 0) {
        setFormData(prev => ({
          ...prev,
          jobDetails: {
            ...prev.jobDetails,
            teamLead: ""
          }
        }));
      }

    } catch (error) {
      console.error("Error fetching team leads:", error);
      toast.error("Failed to load team leads");
      setTeamLeads([]);
    }
  };

  const handleSelectChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setFormData((prev) => {
      const newData = { ...prev };
      const fields = field.split(".");
      if (fields.length === 1) {
        newData[fields[0]] = value;
      } else if (fields.length === 2) {
        newData[fields[0]][fields[1]] = value;
      } else if (fields.length === 3) {
        newData[fields[0]][fields[1]][fields[2]] = value;
      }
      if (field === "jobDetails.departmentId") {
        const selectedDept = departments.find((dept) => dept.value === value);
        if (selectedDept) {
          newData.jobDetails.department = selectedDept.name;
          newData.jobDetails.departmentId = value;
        }
      }
      if (field === "jobDetails.organizationId") {
        const selectedOrg = organizations.find((org) => org.value === value);
        if (selectedOrg) {
          newData.jobDetails.organization = selectedOrg.label;
          newData.jobDetails.organizationId = value;
        }
      }
      if (field === "jobDetails.employeeTypeId") {
        const selectedType = employeeTypes.find((type) => type.value === value);
        if (selectedType) {
          newData.jobDetails.employeeType = selectedType.typeName;
          newData.jobDetails.employeeTypeId = value;
        }
      }
      // In the handleSelectChange function, update the category handler:
      if (field === "jobDetails.categoryId") {
        const selectedCategory = categories.find((cat) => cat.value === value);
        if (selectedCategory) {
          const isTeamLead = selectedCategory.categoryName?.toLowerCase() === "team lead";

          newData.jobDetails.category = selectedCategory.categoryName;
          newData.jobDetails.categoryId = value;

          // If category is "Team Lead", clear team lead selection
          if (isTeamLead) {
            newData.jobDetails.teamLead = "";
          }

          // Fetch team leads when category changes and it's not "Team Lead"
          if (!isTeamLead &&
            newData.jobDetails.organizationId &&
            newData.jobDetails.departmentId) {
            fetchTeamLeads(
              newData.jobDetails.organizationId,
              newData.jobDetails.departmentId,
              newData.jobDetails.categoryId,
              employeeData?._id
            );
          }
        }
      }
      return newData;
    });
  };

  const handleRadioChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle payslip structure changes
  const handlePayslipStructureChange = (updatedStructure) => {
    setFormData((prev) => ({
      ...prev,
      payslipStructure: updatedStructure,
    }));
  };

  // Handle Compliance & Configuration Changes
  const handleComplianceChange = (field, value) => {
    // 1. ESIC Applicability Check
    if (field === "esicApplicable") {
      if (value === "yes") {
        const basicSalary = parseFloat(formData.payslipStructure.basicSalary) || 0;
        if (basicSalary > 21000) {
          toast.error("ESIC is not applicable for Basic Salary > ₹21,000");
          return;
        }
      }

      // Update form data and dynamic deductions
      setFormData((prev) => {
        let updatedDeductions = [...prev.payslipStructure.deductions];

        if (value === "yes") {
          // ESIC is YES: 
          // 1. Remove "Provident Fund (Employer)" if exists
          updatedDeductions = updatedDeductions.filter(d => d.name !== "Provident Fund (Employer)");

          // 2. Add "Employee State Insurance (ESIC)" (0.75%) if not exists
          const hasESIC = updatedDeductions.some(d => d.name === "Employee State Insurance (ESIC)");
          if (!hasESIC) {
            updatedDeductions.push({
              name: "Employee State Insurance (ESIC)",
              enabled: true,
              editable: false,
              calculationType: "percentage",
              percentage: 0.75,
              fixedAmount: 0,
            });
          }

          // 3. Add "Employee State Insurance (ESIC) - Employer" (3.25%) if not exists
          const hasEmployerESIC = updatedDeductions.some(d => d.name === "Employee State Insurance (ESIC) - Employer");
          if (!hasEmployerESIC) {
            updatedDeductions.push({
              name: "Employee State Insurance (ESIC) - Employer",
              enabled: true,
              editable: false,
              calculationType: "percentage",
              percentage: 3.25,
              fixedAmount: 0,
            });
          }
        } else {
          // ESIC is NO:
          // 1. Remove both ESIC components
          updatedDeductions = updatedDeductions.filter(
            d => d.name !== "Employee State Insurance (ESIC)" &&
              d.name !== "Employee State Insurance (ESIC) - Employer"
          );

          // 2. Add "Provident Fund (Employer)" back if PF is applicable
          if (prev.pfApplicable === "yes") {
            const hasEmployerPF = updatedDeductions.some(d => d.name === "Provident Fund (Employer)");
            if (!hasEmployerPF) {
              updatedDeductions.push({
                name: "Provident Fund (Employer)",
                enabled: true,
                editable: false,
                calculationType: "percentage",
                percentage: 13,
                fixedAmount: 0
              });
            }
          }
        }

        return {
          ...prev,
          esicApplicable: value,
          payslipStructure: {
            ...prev.payslipStructure,
            deductions: updatedDeductions
          }
        };
      });
      return;
    }

    // 2. PF Applicability Check
    if (field === "pfApplicable") {
      setFormData((prev) => {
        let updatedDeductions = [...prev.payslipStructure.deductions];

        if (value === "yes") {
          // Add PF Employee (12%)
          const hasEmployeePF = updatedDeductions.some(d => d.name === "Provident Fund (Employee)");
          if (!hasEmployeePF) {
            updatedDeductions.push({
              name: "Provident Fund (Employee)",
              enabled: true,
              editable: false,
              calculationType: "percentage",
              percentage: 12,
              fixedAmount: 0
            });
          }

          // Check if ESIC is NO, then add Employer PF (13%)
          if (prev.esicApplicable !== "yes") {
            const hasEmployerPF = updatedDeductions.some(d => d.name === "Provident Fund (Employer)");
            // Also check for legacy "Provident Fund" and remove it if we are adding the system one
            const hasLegacyPF = updatedDeductions.some(d => d.name === "Provident Fund");

            if (hasLegacyPF) {
              updatedDeductions = updatedDeductions.filter(d => d.name !== "Provident Fund");
            }

            if (!hasEmployerPF) {
              updatedDeductions.push({
                name: "Provident Fund (Employer)",
                enabled: true,
                editable: false,
                calculationType: "percentage",
                percentage: 13,
                fixedAmount: 0
              });
            }
          }
        } else {
          // Remove PF components (including legacy "Provident Fund" if any)
          updatedDeductions = updatedDeductions.filter(
            d => d.name !== "Provident Fund (Employee)" &&
              d.name !== "Provident Fund (Employer)" &&
              d.name !== "Provident Fund"
          );
        }

        return {
          ...prev,
          pfApplicable: value,
          payslipStructure: {
            ...prev.payslipStructure,
            deductions: updatedDeductions
          }
        };
      });
      return;
    }

    // Default handler for other fields
    handleRadioChange(field, value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee ID is always required
    if (!formData.employeeId) {
      newErrors.employeeId = "Employee ID is required";
    }

    // Password validation for new users
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // For attendance-only role, only validate basic fields
    if (formData.role === "attendance_only") {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Regular employee validation continues below
    // Emergency Contact Validation
    const ec = formData.personalDetails.emergencyContact;
    if (ec?.name && !ec.relationship) {
      newErrors["personalDetails.emergencyContact.relationship"] = "Relationship is required";
    }
    if (ec?.name && !ec.phone) {
      newErrors["personalDetails.emergencyContact.phone"] = "Phone number is required";
    } else if (
      ec?.phone &&
      !validators.phone(ec.phone)
    ) {
      newErrors["personalDetails.emergencyContact.phone"] = "Invalid phone number";
    }

    if (!formData.personalDetails.firstName) {
      newErrors["personalDetails.firstName"] = "First name is required";
    } else if (!validators.name(formData.personalDetails.firstName)) {
      newErrors["personalDetails.firstName"] =
        "First name should contain only alphabets and spaces (1-40 characters)";
    }
    if (!formData.personalDetails.lastName) {
      newErrors["personalDetails.lastName"] = "Last name is required";
    } else if (!validators.name(formData.personalDetails.lastName)) {
      newErrors["personalDetails.lastName"] =
        "Last name should contain only alphabets and spaces (1-40 characters)";
    }
    if (!formData.personalDetails.email) {
      newErrors["personalDetails.email"] = "Email is required";
    } else if (!validators.email(formData.personalDetails.email)) {
      newErrors["personalDetails.email"] = "Please enter a valid email address";
    }
    if (!formData.personalDetails.phone) {
      newErrors["personalDetails.phone"] = "Phone number is required";
    } else if (!validators.phone(formData.personalDetails.phone)) {
      newErrors["personalDetails.phone"] =
        "Please enter a valid 10-digit Indian phone number starting with 6-9";
    }
    if (!formData.personalDetails.dateOfJoining) {
      newErrors["personalDetails.dateOfJoining"] =
        "Date of joining is required";
    }
    if (!formData.jobDetails.organizationId) {
      newErrors["jobDetails.organizationId"] = "Organization is required";
    }
    if (!formData.jobDetails.departmentId) {
      newErrors["jobDetails.departmentId"] = "Department is required";
    }
    if (!formData.jobDetails.employeeTypeId) {
      newErrors["jobDetails.employeeTypeId"] = "Employee type is required";
    }
    if (!formData.jobDetails.categoryId) {
      newErrors["jobDetails.categoryId"] = "Category is required";
    }
    // Removed validation for basic salary in salaryDetails since it's no longer there
    // NEW: Validate payslip structure
    if (
      !formData.payslipStructure.basicSalary ||
      formData.payslipStructure.basicSalary <= 0
    ) {
      newErrors["payslipStructure.basicSalary"] =
        "Basic salary in payslip structure must be greater than 0";
    }
    if (!formData.payslipStructure.salaryType) {
      newErrors["payslipStructure.salaryType"] = "Salary type is required";
    }
    // Corrected validation (only requires earnings for monthly salary)
    if (formData.payslipStructure.salaryType === "monthly") {
      if (
        !formData.payslipStructure.earnings ||
        formData.payslipStructure.earnings.length === 0
      ) {
        newErrors["payslipStructure.earnings"] =
          "At least one earning component is required for monthly salary";
      }
    }
    // Note: No validation for earnings if salaryType is "perday"
    if (!formData.salaryDetails.bankAccount.accountNumber) {
      newErrors["salaryDetails.bankAccount.accountNumber"] =
        "Account number is required";
    } else if (
      !validators.accountNumber(
        formData.salaryDetails.bankAccount.accountNumber
      )
    ) {
      newErrors["salaryDetails.bankAccount.accountNumber"] =
        "Account number must be 9-18 digits";
    }
    if (!formData.salaryDetails.bankAccount.bankName) {
      newErrors["salaryDetails.bankAccount.bankName"] = "Bank name is required";
    }
    if (!formData.salaryDetails.bankAccount.ifscCode) {
      newErrors["salaryDetails.bankAccount.ifscCode"] = "IFSC code is required";
    } else if (!validators.ifsc(formData.salaryDetails.bankAccount.ifscCode)) {
      newErrors["salaryDetails.bankAccount.ifscCode"] =
        "Please enter a valid IFSC code (e.g., SBIN0001234)";
    }
    const cleanedAadhar =
      formData.salaryDetails.aadharNumber?.replace(/\s/g, "") || "";
    if (!formData.salaryDetails.aadharNumber) {
      newErrors["salaryDetails.aadharNumber"] = "Aadhar Number is required";
    } else if (!validators.aadhar(cleanedAadhar)) {
      newErrors["salaryDetails.aadharNumber"] =
        "Please enter a valid 12-digit Aadhar number";
    }
    if (
      formData.personalDetails.address.zipCode &&
      !validators.zip(formData.personalDetails.address.zipCode)
    ) {
      newErrors["personalDetails.address.zipCode"] =
        "Please enter a valid 6-digit ZIP code";
    }
    if (!formData.workingHr || isNaN(parseFloat(formData.workingHr))) {
      newErrors["workingHr"] = "Working hours must be a valid number";
    }
    if (formData.attendanceApproval.required === "yes") {
      if (!formData.attendanceApproval.shift1Supervisor) {
        newErrors["attendanceApproval.shift1Supervisor"] =
          "Shift 1 supervisor is required";
      }
      if (!formData.attendanceApproval.shift2Supervisor) {
        newErrors["attendanceApproval.shift2Supervisor"] =
          "Shift 2 supervisor is required";
      }
    }

    // Team lead validation (only if category exists and is not "Team Lead")
    if (formData.jobDetails.categoryId &&
      formData.jobDetails.category?.toLowerCase() !== "team lead" &&
      !formData.jobDetails.teamLead) {
      // Optional: Only validate if you want team lead to be required
      // newErrors["jobDetails.teamLeadId"] = "Team lead is required for this category";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log(formData);

    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      // Scroll to first error
      const firstErrorElement = document.querySelector(".border-red-300");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/payroll/employees/${employeeData._id}`
        : "/api/payroll/employees";
      const method = isEdit ? "PUT" : "POST";
      const submitData = {
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
          phone: formData.personalDetails.phone.replace(/\s/g, ""),
        },
        salaryDetails: {
          ...formData.salaryDetails,
          panNumber: formData.salaryDetails.panNumber
            .replace(/\s/g, "")
            .toUpperCase(),
          aadharNumber: formData.salaryDetails.aadharNumber.replace(/\s/g, ""),
          bankAccount: {
            ...formData.salaryDetails.bankAccount,
            ifscCode: formData.salaryDetails.bankAccount.ifscCode.toUpperCase(),
          },
        },
        documents: uploadedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          category: file.category,
          categoryName: file.categoryName,
          uploadDate: file.uploadDate,
          url: file.url,
          cloudinaryId: file.cloudinaryId,
          cloudinaryUrl: file.cloudinaryUrl,
          thumbnail: file.thumbnail,
        })),
        payslipStructure: formData.payslipStructure,
      };

      console.log("📤 Submitting employee data:", submitData);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const savedEmployee = await response.json();
        toast.success(
          `Employee ${isEdit ? "updated" : "created"} successfully! 🎉`
        );
        console.log("✅ Employee saved:", savedEmployee);
        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.error || "Failed to save employee"}`);
        console.error("❌ Error response:", data);
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("An error occurred while saving the employee");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getFormProgress = () => {
    const requiredFields = [
      // formData.employeeId,
      formData.personalDetails.firstName,
      formData.personalDetails.lastName,
      formData.personalDetails.email,
      formData.personalDetails.phone,
      formData.personalDetails.dateOfJoining,
      formData.jobDetails.organizationId,
      formData.jobDetails.departmentId,
      formData.jobDetails.employeeTypeId,
      formData.jobDetails.categoryId,
      formData.salaryDetails.bankAccount.accountNumber,
      formData.probation,
      formData.isAttending,
      formData.workingHr,
      formData.payslipStructure.basicSalary > 0,
      formData.payslipStructure.earnings.length > 0,
    ];
    const completedFields = requiredFields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const progress = getFormProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {isEdit ? "Edit Employee Profile" : "Add New Employee"}
                </h1>
                <p className="text-slate-600 text-sm mt-0.5">
                  {isEdit
                    ? "Update employee information and salary structure"
                    : "Create a new employee profile with customized salary structure"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Form Completion
            </h3>
            <span className="text-sm font-medium text-slate-600">
              {progress}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div
              className={`flex items-center space-x-2 ${formData.personalDetails.firstName &&
                validators.name(formData.personalDetails.firstName)
                ? "text-green-700"
                : "text-slate-500"
                }`}
            >
              {formData.personalDetails.firstName &&
                validators.name(formData.personalDetails.firstName) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
              )}
              <span>Personal Information</span>
            </div>
            <div
              className={`flex items-center space-x-2 ${formData.jobDetails.organizationId &&
                formData.jobDetails.departmentId &&
                formData.jobDetails.employeeTypeId &&
                formData.jobDetails.categoryId
                ? "text-green-700"
                : "text-slate-500"
                }`}
            >
              {formData.jobDetails.organizationId &&
                formData.jobDetails.departmentId &&
                formData.jobDetails.employeeTypeId &&
                formData.jobDetails.categoryId ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
              )}
              <span>Organization Details</span>
            </div>
            <div
              className={`flex items-center space-x-2 ${formData.probation &&
                formData.isAttending &&
                formData.workingHr
                ? "text-green-700"
                : "text-slate-500"
                }`}
            >
              {formData.probation &&
                formData.isAttending &&
                formData.workingHr ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
              )}
              <span>Financial Information</span>
            </div>
            <div
              className={`flex items-center space-x-2 ${formData.payslipStructure.basicSalary > 0 &&
                formData.payslipStructure.earnings.length > 0
                ? "text-green-700"
                : "text-slate-500"
                }`}
            >
              {formData.payslipStructure.basicSalary > 0 &&
                formData.payslipStructure.earnings.length > 0 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 border-2 border-slate-300 rounded-full"></div>
              )}
              <span>Salary Structure</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account Credentials Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                Account Credentials
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Set up login credentials and access role for the employee
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="employeeId"
                      value={formData.employeeId || ""}
                      onChange={handleChange}
                      placeholder="EMP-001"
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${errors.employeeId
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-300"
                        }`}
                    />
                  </div>
                  {errors.employeeId && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.employeeId}</span>
                    </div>
                  )}
                </div>
                {!isEdit && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${errors.password
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors.password && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.password}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="********"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors.confirmPassword && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.confirmPassword}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <SimpleSelect
                    value={formData.role}
                    onChange={(e) => handleSelectChange("role", e.target.value)}
                    options={[
                      { value: "employee", label: "Employee" },
                      { value: "attendance_only", label: "Attendance Only" },
                      { value: "admin", label: "Admin" },
                    ]}
                    placeholder="Select Role"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance-Only Info Message */}
          {formData.role === "attendance_only" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Attendance-Only User</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    This user will only have access to Attendance Management features.
                    No personal details, salary structure, or other employee information is required.
                  </p>
                  <p className="text-blue-600 text-xs mt-2">
                    After creation, this user can login with Employee ID and Password to access the Attendance Directory.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show remaining form sections only for non-attendance-only roles */}
          {formData.role !== "attendance_only" && (
            <>
              {/* Organization Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    Organization Details
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Select organization, department, employee type, category, and in order
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 1. Organization Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Organization <span className="text-red-500">*</span>
                      </label>
                      {fetchLoading ? (
                        <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                          Loading...
                        </div>
                      ) : (
                        <SimpleSelect
                          value={formData.jobDetails.organizationId}
                          onChange={(e) =>
                            handleSelectChange(
                              "jobDetails.organizationId",
                              e.target.value
                            )
                          }
                          options={organizations}
                          placeholder="Select organization"
                          error={errors["jobDetails.organizationId"]}
                        />
                      )}
                    </div>
                    {/* 2. Department Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Department <span className="text-red-500">*</span>
                      </label>
                      {fetchLoading ? (
                        <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                          Loading...
                        </div>
                      ) : (
                        <SimpleSelect
                          value={formData.jobDetails.departmentId || formData.jobDetails.department}
                          onChange={(e) =>
                            handleSelectChange(
                              "jobDetails.departmentId",
                              e.target.value
                            )
                          }
                          options={departments}
                          placeholder={
                            formData.jobDetails.organizationId
                              ? "Select department"
                              : "Select organization first"
                          }
                          error={errors["jobDetails.departmentId"]}
                          disabled={!formData.jobDetails.organizationId}
                        />
                      )}
                    </div>
                    {/* 3. Employee Type Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Employee Type <span className="text-red-500">*</span>
                      </label>
                      {fetchLoading ? (
                        <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                          Loading...
                        </div>
                      ) : (
                        <SimpleSelect
                          value={formData.jobDetails.employeeTypeId}
                          onChange={(e) =>
                            handleSelectChange("jobDetails.employeeTypeId", e.target.value)
                          }
                          options={employeeTypes}
                          placeholder={
                            formData.jobDetails.organizationId &&
                              formData.jobDetails.departmentId
                              ? "Select employee type"
                              : formData.jobDetails.organizationId
                                ? "Select department first"
                                : "Select organization first"
                          }
                          error={errors["jobDetails.employeeTypeId"]}
                          disabled={
                            !formData.jobDetails.organizationId ||
                            !formData.jobDetails.departmentId
                          }
                        />
                      )}
                    </div>
                    {/* 4. Category Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      {fetchLoading ? (
                        <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                          Loading...
                        </div>
                      ) : (
                        <SimpleSelect
                          value={formData.jobDetails.categoryId}
                          onChange={(e) =>
                            handleSelectChange("jobDetails.categoryId", e.target.value)
                          }
                          options={categories}
                          placeholder={
                            formData.jobDetails.organizationId &&
                              formData.jobDetails.departmentId &&
                              formData.jobDetails.employeeTypeId
                              ? "Select category"
                              : "Complete previous fields first"
                          }
                          error={errors["jobDetails.categoryId"]}
                          disabled={
                            !formData.jobDetails.organizationId ||
                            !formData.jobDetails.departmentId ||
                            !formData.jobDetails.employeeTypeId
                          }
                        />
                      )}
                    </div>

                    {/* 5. Team Lead Dropdown - Only show if category is NOT "Team Lead" */}
                    {formData.jobDetails.categoryId &&
                      formData.jobDetails.category?.toLowerCase() !== "team lead" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Team Lead
                          </label>
                          {fetchLoading ? (
                            <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                              Loading...
                            </div>
                          ) : (
                            <SimpleSelect
                              value={formData.jobDetails.teamLead || ""}
                              onChange={(e) =>
                                handleSelectChange("jobDetails.teamLead", e.target.value)
                              }
                              options={teamLeads}
                              placeholder={
                                formData.jobDetails.organizationId &&
                                  formData.jobDetails.departmentId
                                  ? "Select team lead"
                                  : "Select organization and department first"
                              }
                              disabled={
                                !formData.jobDetails.organizationId ||
                                !formData.jobDetails.departmentId
                              }
                            />
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Select a team lead from the same department
                          </p>
                        </div>
                      )}

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Designation
                      </label>
                      <input
                        name="jobDetails.designation"
                        value={formData.jobDetails.designation || ""}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Work Location
                      </label>
                      <input
                        name="jobDetails.workLocation"
                        value={formData.jobDetails.workLocation || ""}
                        onChange={handleChange}
                        placeholder="Bangalore"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>


                </div>
              </div>

              {/* Personal Details Card */}


              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center border border-yellow-100">
                      <User className="w-4 h-4 text-yellow-600" />
                    </div>
                    Personal Information
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Basic employee details and contact information
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="personalDetails.firstName"
                        value={formData.personalDetails.firstName}
                        onChange={handleChange}
                        maxLength={40}
                        placeholder="Sameer"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["personalDetails.firstName"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["personalDetails.firstName"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["personalDetails.firstName"]}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="personalDetails.lastName"
                        value={formData.personalDetails.lastName}
                        onChange={handleChange}
                        maxLength={40}
                        placeholder="Gaikwad"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["personalDetails.lastName"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["personalDetails.lastName"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["personalDetails.lastName"]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="personalDetails.email"
                          type="email"
                          value={formData.personalDetails.email}
                          onChange={handleChange}
                          maxLength={40}
                          placeholder="sameer.gaikwad@company.com"
                          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["personalDetails.email"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                      </div>
                      {errors["personalDetails.email"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["personalDetails.email"]}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="personalDetails.phone"
                          type="tel"
                          value={formData.personalDetails.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["personalDetails.phone"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                      </div>
                      {errors["personalDetails.phone"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["personalDetails.phone"]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="personalDetails.dateOfBirth"
                          type="date"
                          value={formData.personalDetails.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Gender
                      </label>
                      <SimpleSelect
                        value={formData.personalDetails.gender}
                        onChange={(e) =>
                          handleSelectChange(
                            "personalDetails.gender",
                            e.target.value
                          )
                        }
                        options={genderOptions}
                        placeholder="Select gender"
                      />
                    </div>
                  </div>
                  {/* Blood Group */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Blood Group
                    </label>
                    <SimpleSelect
                      value={formData.personalDetails.bloodGroup}
                      onChange={(e) =>
                        handleSelectChange(
                          "personalDetails.bloodGroup",
                          e.target.value
                        )
                      }
                      options={[
                        { value: "A+", label: "A+" },
                        { value: "A-", label: "A-" },
                        { value: "B+", label: "B+" },
                        { value: "B-", label: "B-" },
                        { value: "AB+", label: "AB+" },
                        { value: "AB-", label: "AB-" },
                        { value: "O+", label: "O+" },
                        { value: "O-", label: "O-" },
                      ]}
                      placeholder="Select Blood Group"
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-6 pt-4 border-t border-slate-100 mt-4">
                    {/* Current Address */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        Current Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">Street Address</label>
                          <input
                            name="personalDetails.currentAddress.street"
                            value={formData.personalDetails.currentAddress?.street || ""}
                            onChange={handleChange}
                            placeholder="Plot No. 42, Sector 17, Vashi"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">City</label>
                          <input
                            name="personalDetails.currentAddress.city"
                            value={formData.personalDetails.currentAddress?.city || ""}
                            onChange={handleChange}
                            placeholder="Navi Mumbai"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">State</label>
                            <input
                              name="personalDetails.currentAddress.state"
                              value={formData.personalDetails.currentAddress?.state || ""}
                              onChange={handleChange}
                              placeholder="Maharashtra"
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">ZIP Code</label>
                            <input
                              name="personalDetails.currentAddress.zipCode"
                              value={formData.personalDetails.currentAddress?.zipCode || ""}
                              onChange={handleChange}
                              placeholder="400703"
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Home className="w-4 h-4 text-slate-500" />
                          Permanent Address
                        </h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  personalDetails: {
                                    ...prev.personalDetails,
                                    permanentAddress: { ...prev.personalDetails.currentAddress }
                                  }
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                          />
                          <span className="text-xs text-slate-600">Same as Current</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">Street Address</label>
                          <input
                            name="personalDetails.permanentAddress.street"
                            value={formData.personalDetails.permanentAddress?.street || ""}
                            onChange={handleChange}
                            placeholder="Plot No. 42, Sector 17, Vashi"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">City</label>
                          <input
                            name="personalDetails.permanentAddress.city"
                            value={formData.personalDetails.permanentAddress?.city || ""}
                            onChange={handleChange}
                            placeholder="Navi Mumbai"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">State</label>
                            <input
                              name="personalDetails.permanentAddress.state"
                              value={formData.personalDetails.permanentAddress?.state || ""}
                              onChange={handleChange}
                              placeholder="Maharashtra"
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">ZIP Code</label>
                            <input
                              name="personalDetails.permanentAddress.zipCode"
                              value={formData.personalDetails.permanentAddress?.zipCode || ""}
                              onChange={handleChange}
                              placeholder="400703"
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Date of Joining <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="personalDetails.dateOfJoining"
                          type="date"
                          value={formData.personalDetails?.dateOfJoining || ""}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["personalDetails.dateOfJoining"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                      </div>
                      {errors["personalDetails.dateOfJoining"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["personalDetails.dateOfJoining"]}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Employee Status <span className="text-red-500">*</span>
                      </label>
                      <SimpleSelect
                        value={formData.status}
                        onChange={(e) =>
                          handleSelectChange("status", e.target.value)
                        }
                        options={statusOptions}
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      Emergency Contact Person
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Contact Name</label>
                        <input
                          name="personalDetails.emergencyContact.name"
                          value={formData.personalDetails.emergencyContact?.name || ""}
                          onChange={handleChange}
                          placeholder="Amit Gaikwad"
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Relationship</label>
                        <input
                          name="personalDetails.emergencyContact.relationship"
                          value={formData.personalDetails.emergencyContact?.relationship || ""}
                          onChange={handleChange}
                          placeholder="Brother"
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors["personalDetails.emergencyContact.relationship"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                        {errors["personalDetails.emergencyContact.relationship"] && (
                          <div className="flex items-center space-x-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors["personalDetails.emergencyContact.relationship"]}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input
                          name="personalDetails.emergencyContact.phone"
                          value={formData.personalDetails.emergencyContact?.phone || ""}
                          onChange={handleChange}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors["personalDetails.emergencyContact.phone"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                        {errors["personalDetails.emergencyContact.phone"] && (
                          <div className="flex items-center space-x-1 text-red-600 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors["personalDetails.emergencyContact.phone"]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="block text-sm font-medium text-slate-700">Address</label>
                      <input
                        name="personalDetails.emergencyContact.address"
                        value={formData.personalDetails.emergencyContact?.address || ""}
                        onChange={handleChange}
                        placeholder="Plot No. 42, Sector 17, Vashi, Navi Mumbai"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information Card - Updated to remove basic salary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center border border-green-100">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    Financial Information
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Bank account information and compliance data (Basic salary is
                    now configured in Salary Structure section)
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        PAN Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="salaryDetails.panNumber"
                          value={formData.salaryDetails.panNumber}
                          onChange={handleChange}
                          placeholder="ABCDE1234F"
                          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["salaryDetails.panNumber"]
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-slate-300"
                            }`}
                        />
                      </div>
                      {errors["salaryDetails.panNumber"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["salaryDetails.panNumber"]}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Aadhar Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="salaryDetails.aadharNumber"
                        value={formData.salaryDetails.aadharNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["salaryDetails.aadharNumber"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["salaryDetails.aadharNumber"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["salaryDetails.aadharNumber"]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Bank Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="salaryDetails.bankAccount.accountNumber"
                        value={formData.salaryDetails.bankAccount.accountNumber}
                        onChange={handleChange}
                        maxLength={20}
                        placeholder="123456789012"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["salaryDetails.bankAccount.accountNumber"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["salaryDetails.bankAccount.accountNumber"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {errors["salaryDetails.bankAccount.accountNumber"]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="salaryDetails.bankAccount.bankName"
                        value={formData.salaryDetails.bankAccount.bankName}
                        onChange={handleChange}
                        placeholder="HDFC Bank"
                        maxLength={40}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["salaryDetails.bankAccount.bankName"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["salaryDetails.bankAccount.bankName"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {errors["salaryDetails.bankAccount.bankName"]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="salaryDetails.bankAccount.ifscCode"
                        value={formData.salaryDetails.bankAccount.ifscCode}
                        onChange={handleChange}
                        placeholder="HDFC0001234"
                        maxLength={11}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["salaryDetails.bankAccount.ifscCode"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["salaryDetails.bankAccount.ifscCode"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>
                            {errors["salaryDetails.bankAccount.ifscCode"]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Branch Name
                      </label>
                      <input
                        name="salaryDetails.bankAccount.branch"
                        value={formData.salaryDetails.bankAccount.branch}
                        onChange={handleChange}
                        maxLength={30}
                        placeholder="Vashi Branch"
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>


              {/* Compliance & Configuration Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center border border-green-100">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    Compliance & Configuration
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Configure statutory compliance settings affecting salary structure
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PF Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is PF Applicable
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pfApplicable"
                            value="yes"
                            checked={formData.pfApplicable === "yes"}
                            onChange={(e) =>
                              handleComplianceChange("pfApplicable", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="pfApplicable"
                            value="no"
                            checked={formData.pfApplicable === "no"}
                            onChange={(e) =>
                              handleComplianceChange("pfApplicable", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* ESIC Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is ESIC Applicable
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="esicApplicable"
                            value="yes"
                            checked={formData.esicApplicable === "yes"}
                            onChange={(e) =>
                              handleComplianceChange("esicApplicable", e.target.value)
                            }
                            disabled={
                              (parseFloat(formData.payslipStructure?.basicSalary) || 0) > 21000
                            }
                            className={`w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300 ${(parseFloat(formData.payslipStructure?.basicSalary) || 0) > 21000
                              ? "cursor-not-allowed opacity-50"
                              : ""
                              }`}
                          />
                          <span className={`text-sm text-slate-700 ${(parseFloat(formData.payslipStructure?.basicSalary) || 0) > 21000
                            ? "opacity-50"
                            : ""
                            }`}>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="esicApplicable"
                            value="no"
                            checked={formData.esicApplicable === "no"}
                            onChange={(e) =>
                              handleComplianceChange("esicApplicable", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                      {(parseFloat(formData.payslipStructure?.basicSalary) || 0) > 21000 && (
                        <p className="text-xs text-red-500">Not applicable for Basic Salary &gt; ₹21,000</p>
                      )}
                    </div>

                    {/* PT Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is Compliant (PT Applicable)
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isCompliant"
                            checked={formData.isCompliant === true}
                            onChange={() => handleComplianceChange("isCompliant", true)}
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isCompliant"
                            checked={formData.isCompliant === false}
                            onChange={() => handleComplianceChange("isCompliant", false)}
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* TDS Toggle */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is TDS Applicable
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isTDSApplicable"
                            value="yes"
                            checked={formData.isTDSApplicable === true}
                            onChange={() =>
                              handleComplianceChange("isTDSApplicable", true)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isTDSApplicable"
                            value="no"
                            checked={formData.isTDSApplicable === false}
                            onChange={() =>
                              handleComplianceChange("isTDSApplicable", false)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payslip Structure Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                      <BadgeDollarSign className="w-4 h-4 text-purple-600" />
                    </div>
                    Salary Structure
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Configure salary components, earnings, and deductions with PT &
                    PF auto-calculation
                  </p>
                </div>
                <div className="p-6">
                  <PayslipStructureSection
                    payslipStructure={formData.payslipStructure}
                    onStructureChange={handlePayslipStructureChange}
                    errors={errors}
                    employeeGender={formData.personalDetails.gender}
                    pfApplicable={formData.pfApplicable}
                    esicApplicable={formData.esicApplicable}
                    isTdsApplicable={formData.isTDSApplicable}
                    isCompliant={formData.isCompliant}
                  />
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                    </div>
                    Additional Information & Documents
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Employee status, preferences, attendance approval, and document
                    uploads
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Working Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="workingHr"
                        value={formData.workingHr}
                        onChange={handleChange}
                        placeholder="9hr"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${errors["workingHr"]
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300"
                          }`}
                      />
                      {errors["workingHr"] && (
                        <div className="flex items-center space-x-1 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors["workingHr"]}</span>
                        </div>
                      )}
                    </div>



                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is Probation
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="probation"
                            value="yes"
                            checked={formData.probation === "yes"}
                            onChange={(e) =>
                              handleRadioChange("probation", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="probation"
                            value="no"
                            checked={formData.probation === "no"}
                            onChange={(e) =>
                              handleRadioChange("probation", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is OT Applicable
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="otApplicable"
                            value="yes"
                            checked={formData.otApplicable === "yes"}
                            onChange={(e) =>
                              handleRadioChange("otApplicable", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="otApplicable"
                            value="no"
                            checked={formData.otApplicable === "no"}
                            onChange={(e) =>
                              handleRadioChange("otApplicable", e.target.value)
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Is Attendance Approval Required{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="attendanceApproval.required"
                            value="yes"
                            checked={formData.attendanceApproval.required === "yes"}
                            onChange={(e) =>
                              handleRadioChange(
                                "attendanceApproval.required",
                                e.target.value
                              )
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="attendanceApproval.required"
                            value="no"
                            checked={formData.attendanceApproval.required === "no"}
                            onChange={(e) =>
                              handleRadioChange(
                                "attendanceApproval.required",
                                e.target.value
                              )
                            }
                            className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">No</span>
                        </label>
                      </div>
                    </div>
                  </div>


                  {/* Supervisor Selection Section */}
                  {formData.attendanceApproval.required === "yes" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        Attendance Approval Supervisors
                      </h3>
                      <p className="text-slate-600 text-sm mb-6">
                        Select supervisors who will approve attendance for each
                        shift
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shift 1 Supervisor */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              Shift 1 Supervisor{" "}
                              <span className="text-red-500">*</span>
                            </div>
                          </label>
                          {loadingSupervisors ? (
                            <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                              Loading supervisors...
                            </div>
                          ) : (
                            <SimpleSelect
                              value={formData.attendanceApproval.shift1Supervisor}
                              onChange={(e) =>
                                handleSelectChange(
                                  "attendanceApproval.shift1Supervisor",
                                  e.target.value
                                )
                              }
                              options={availableSupervisors}
                              placeholder={
                                formData.jobDetails.organizationId
                                  ? "Select shift 1 supervisor"
                                  : "Select organization first"
                              }
                              error={errors["attendanceApproval.shift1Supervisor"]}
                              disabled={
                                !formData.jobDetails.organizationId ||
                                loadingSupervisors
                              }
                            />
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Supervisor for morning/day shift attendance approval
                          </p>
                        </div>
                        {/* Shift 2 Supervisor */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              Shift 2 Supervisor{" "}
                              <span className="text-red-500">*</span>
                            </div>
                          </label>
                          {loadingSupervisors ? (
                            <div className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-100 animate-pulse">
                              Loading supervisors...
                            </div>
                          ) : (
                            <SimpleSelect
                              value={formData.attendanceApproval.shift2Supervisor}
                              onChange={(e) =>
                                handleSelectChange(
                                  "attendanceApproval.shift2Supervisor",
                                  e.target.value
                                )
                              }
                              options={availableSupervisors}
                              placeholder={
                                formData.jobDetails.organizationId
                                  ? "Select shift 2 supervisor"
                                  : "Select organization first"
                              }
                              error={errors["attendanceApproval.shift2Supervisor"]}
                              disabled={
                                !formData.jobDetails.organizationId ||
                                loadingSupervisors
                              }
                            />
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Supervisor for evening/night shift attendance approval
                          </p>
                        </div>
                      </div>
                      {availableSupervisors.length === 0 &&
                        formData.jobDetails.organizationId &&
                        !loadingSupervisors && (
                          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                              No supervisors available for this organization. Please
                              create employee profiles first before assigning
                              supervisors.
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                  {/* Document Upload Section */}
                  {formData.jobDetails.categoryId && (
                    <div className="space-y-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        Employee Documents
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Upload all required documents for employee verification.
                        Files will be uploaded to Cloudinary. Required documents are
                        marked with <span className="text-red-500">*</span>
                      </p>
                      <DocumentUploadSection
                        uploadedFiles={uploadedFiles}
                        onFilesChange={handleFilesChange}
                        onFileRemove={handleFileRemove}
                        onFileView={(file) => window.open(file.url, "_blank")}
                        employeeCategory={formData.jobDetails.category}
                        categoryId={formData.jobDetails.categoryId}
                      />
                    </div>
                  )}
                </div>
              </div>

            </>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchLoading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Update Employee" : "Create Employee"}
                </>
              )}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
}
