import React from 'react';
import { FaAward, FaCertificate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi';
import type { CertificateData } from '~/types/certificate';

interface CertificateCardProps {
    certificate: CertificateData;
    studentName?: string;
    subjectName?: string;
    onView?: () => void;
    onDownload?: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
    certificate,
    studentName = 'Student Name',
    subjectName = 'Subject',
    onView,
    onDownload
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Certificate Frame */}
            <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-lg shadow-2xl overflow-hidden border-4 border-amber-300">
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-amber-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-amber-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-500 rounded-br-lg"></div>

                {/* Inner border */}
                <div className="absolute inset-4 border-2 border-amber-200 rounded-lg pointer-events-none"></div>

                {/* Certificate Content */}
                <div className="relative px-12 py-10 text-center">
                    {/* Header with Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                            <HiAcademicCap className="text-white text-4xl" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-serif font-bold text-amber-800 mb-1 tracking-wide">
                        CERTIFICATE
                    </h1>
                    <h2 className="text-lg font-serif text-amber-700 mb-6 tracking-widest">
                        OF ACHIEVEMENT
                    </h2>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                        <FaAward className="mx-4 text-amber-500 text-2xl" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                    </div>

                    <p className="text-gray-600 text-sm mb-2 tracking-wide">This is to certify that</p>

                    {/* Student Name */}
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 py-2 border-b-2 border-amber-300 inline-block px-8">
                        {studentName}
                    </h3>

                    <p className="text-gray-600 text-sm mt-4 mb-2 tracking-wide">
                        has successfully completed the requirements for
                    </p>

                    {/* Subject/Course */}
                    <h4 className="text-xl font-semibold text-teal-700 mb-4">
                        {subjectName}
                    </h4>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                        <FaCertificate className="mx-4 text-amber-400 text-xl" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    </div>

                    {/* Certificate Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate Number</p>
                            <p className="text-sm font-mono font-semibold text-gray-700">{certificate.certificateNumber.slice(0,8).toLocaleUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                            <p className="text-sm font-semibold text-gray-700">{formatDate(certificate.issueDate)}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        {certificate.isValid ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                                <FaCheckCircle />
                                Verified & Valid
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">
                                <FaTimesCircle />
                                Invalid
                            </span>
                        )}
                    </div>

                    {/* Footer with signature area */}
                    <div className="flex justify-between items-end mt-8 pt-6 border-t border-amber-200">
                        <div className="text-center">
                            <div className="w-32 h-px bg-gray-400 mb-2"></div>
                            <p className="text-xs text-gray-500">Authorized Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center border-2 border-amber-300">
                                <FaAward className="text-amber-600 text-2xl" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Official Seal</p>
                        </div>
                        <div className="text-center">
                            <div className="w-32 h-px bg-gray-400 mb-2"></div>
                            <p className="text-xs text-gray-500">Date</p>
                        </div>
                    </div>
                </div>

                {/* Watermark Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <HiAcademicCap className="text-[300px] text-amber-900" />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {(onView || onDownload) && (
                <div className="flex justify-center gap-4 mt-6">
                    {onView && (
                        <button
                            onClick={onView}
                            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            View Full Size
                        </button>
                    )}
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            Download PDF
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CertificateCard;
