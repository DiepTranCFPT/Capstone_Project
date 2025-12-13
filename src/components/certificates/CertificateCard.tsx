import { forwardRef } from 'react';
import { FaAward, FaCertificate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi';
import type { CertificateData } from '~/types/certificate';

interface CertificateCardProps {
    certificate: CertificateData;
    studentName?: string;
    subjectName?: string;
    onView?: () => void;
    onDownload?: () => void;
    hideActions?: boolean;
}

const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(({
    certificate,
    studentName = 'Student Name',
    subjectName = 'Subject',
    onView,
    onDownload,
    hideActions = false
}, ref) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Inline styles to ensure html2canvas compatibility (avoids oklch color parsing issues)
    const safeStyles = {
        frame: {
            background: 'linear-gradient(to bottom right, #fffbeb, #ffffff, #fffbeb)',
            borderColor: '#fcd34d',
        },
        corner: {
            borderColor: '#f59e0b',
        },
        innerBorder: {
            borderColor: '#fde68a',
        },
        logo: {
            background: 'linear-gradient(to bottom right, #fbbf24, #d97706)',
        },
        title: {
            color: '#92400e', // amber-800
        },
        subtitle: {
            color: '#b45309', // amber-700
        },
        decorativeLine: {
            background: 'linear-gradient(to right, transparent, #fbbf24, transparent)',
        },
        icon: {
            color: '#f59e0b', // amber-500
        },
        iconSmall: {
            color: '#fbbf24', // amber-400
        },
        text: {
            color: '#4b5563', // gray-600
        },
        textDark: {
            color: '#1f2937', // gray-800
        },
        textLight: {
            color: '#6b7280', // gray-500
        },
        subjectText: {
            color: '#0f766e', // teal-700
        },
        studentNameBorder: {
            borderColor: '#fcd34d', // amber-300
        },
        validBadge: {
            backgroundColor: '#dcfce7', // green-100
            color: '#15803d', // green-700
            borderColor: '#bbf7d0', // green-200
        },
        invalidBadge: {
            backgroundColor: '#fee2e2', // red-100
            color: '#b91c1c', // red-700
            borderColor: '#fecaca', // red-200
        },
        footerBorder: {
            borderColor: '#fde68a', // amber-200
        },
        signatureLine: {
            backgroundColor: '#9ca3af', // gray-400
        },
        seal: {
            background: 'linear-gradient(to bottom right, #fef3c7, #fde68a)',
            borderColor: '#fcd34d',
        },
        sealIcon: {
            color: '#d97706', // amber-600
        },
        watermark: {
            color: '#78350f', // amber-900
        },
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Certificate Frame */}
            <div
                ref={ref}
                className="relative rounded-lg shadow-2xl overflow-hidden border-4"
                style={safeStyles.frame}
            >
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 rounded-tl-lg" style={safeStyles.corner}></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 rounded-tr-lg" style={safeStyles.corner}></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 rounded-bl-lg" style={safeStyles.corner}></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 rounded-br-lg" style={safeStyles.corner}></div>

                {/* Inner border */}
                <div className="absolute inset-4 border-2 rounded-lg pointer-events-none" style={safeStyles.innerBorder}></div>

                {/* Certificate Content */}
                <div className="relative px-12 py-10 text-center">
                    {/* Header with Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={safeStyles.logo}>
                            <HiAcademicCap style={{ color: '#ffffff' }} className="text-4xl" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-serif font-bold mb-1 tracking-wide" style={safeStyles.title}>
                        CERTIFICATE
                    </h1>
                    <h2 className="text-lg font-serif mb-6 tracking-widest" style={safeStyles.subtitle}>
                        OF ACHIEVEMENT
                    </h2>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex-1 h-px" style={safeStyles.decorativeLine}></div>
                        <FaAward className="mx-4 text-2xl" style={safeStyles.icon} />
                        <div className="flex-1 h-px" style={safeStyles.decorativeLine}></div>
                    </div>

                    <p className="text-sm mb-2 tracking-wide" style={safeStyles.text}>This is to certify that</p>

                    {/* Student Name */}
                    <h3 className="text-2xl font-serif font-bold mb-2 py-2 border-b-2 inline-block px-8" style={{ ...safeStyles.textDark, ...safeStyles.studentNameBorder }}>
                        {studentName}
                    </h3>

                    <p className="text-sm mt-4 mb-2 tracking-wide" style={safeStyles.text}>
                        has successfully completed the requirements for
                    </p>

                    {/* Subject/Course */}
                    <h4 className="text-xl font-semibold mb-4" style={safeStyles.subjectText}>
                        {subjectName}
                    </h4>

                    {/* Decorative line */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex-1 h-px" style={safeStyles.decorativeLine}></div>
                        <FaCertificate className="mx-4 text-xl" style={safeStyles.iconSmall} />
                        <div className="flex-1 h-px" style={safeStyles.decorativeLine}></div>
                    </div>

                    {/* Certificate Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-wider mb-1" style={safeStyles.textLight}>Certificate Number</p>
                            <p className="text-sm font-mono font-semibold" style={{ color: '#374151' }}>{certificate.certificateNumber.slice(0, 8).toLocaleUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wider mb-1" style={safeStyles.textLight}>Issue Date</p>
                            <p className="text-sm font-semibold" style={{ color: '#374151' }}>{formatDate(certificate.issueDate)}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        {certificate.isValid ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={safeStyles.validBadge}>
                                <FaCheckCircle />
                                Verified & Valid
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={safeStyles.invalidBadge}>
                                <FaTimesCircle />
                                Invalid
                            </span>
                        )}
                    </div>

                    {/* Footer with signature area */}
                    <div className="flex justify-between items-end mt-8 pt-6 border-t" style={safeStyles.footerBorder}>
                        <div className="text-center">
                            <div className="w-32 h-px mb-2" style={safeStyles.signatureLine}></div>
                            <p className="text-xs" style={safeStyles.textLight}>Authorized Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-2" style={safeStyles.seal}>
                                <FaAward className="text-2xl" style={safeStyles.sealIcon} />
                            </div>
                            <p className="text-xs mt-1" style={safeStyles.textLight}>Official Seal</p>
                        </div>
                        <div className="text-center">
                            <div className="w-32 h-px mb-2" style={safeStyles.signatureLine}></div>
                            <p className="text-xs" style={safeStyles.textLight}>Date</p>
                        </div>
                    </div>
                </div>

                {/* Watermark Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <HiAcademicCap className="text-[300px]" style={safeStyles.watermark} />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {!hideActions && (onView || onDownload) && (
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
});

CertificateCard.displayName = 'CertificateCard';

export default CertificateCard;
