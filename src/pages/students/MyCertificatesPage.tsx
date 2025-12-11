import React, { useEffect, useState } from 'react';
import { Empty, Modal } from 'antd';
import { FaCertificate, FaEye, FaDownload } from 'react-icons/fa';
import { useCertificates } from '~/hooks/useCertificates';
import { useSubjects } from '~/hooks/useSubjects';
import { useAuth } from '~/hooks/useAuth';
import CertificateCard from '~/components/certificates/CertificateCard';
import type { CertificateData } from '~/types/certificate';
import Loading from '~/components/common/Loading';

const MyCertificatesPage: React.FC = () => {
    const { certificates, isLoading, error, fetchMyCertificates } = useCertificates();
    const { getSubjectById } = useSubjects();
    const { user } = useAuth();
    const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subjectNames, setSubjectNames] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchMyCertificates();
    }, [fetchMyCertificates]);

    // Fetch subject names for each certificate
    useEffect(() => {
        const fetchSubjectNames = async () => {
            if (certificates.length === 0) return;

            const uniqueSubjectIds = [...new Set(certificates.map(c => c.subjectId))];
            const namesMap: Record<string, string> = {};

            await Promise.all(
                uniqueSubjectIds.map(async (subjectId) => {
                    if (!subjectId || subjectNames[subjectId]) return;
                    try {
                        const subject = await getSubjectById(subjectId);
                        if (subject?.name) {
                            namesMap[subjectId] = subject.name;
                        }
                    } catch {
                        // Ignore errors
                    }
                })
            );

            if (Object.keys(namesMap).length > 0) {
                setSubjectNames(prev => ({ ...prev, ...namesMap }));
            }
        };

        fetchSubjectNames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [certificates]);

    const handleViewCertificate = (cert: CertificateData) => {
        setSelectedCertificate(cert);
        setIsModalOpen(true);
    };

    const handleDownload = (cert: CertificateData) => {
        if (cert.certificateUrl) {
            window.open(cert.certificateUrl, '_blank');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-500">
                    <p className="text-lg font-semibold">Error loading certificates</p>
                    {/* <p className="text-sm">{error}</p> */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FaCertificate className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">My Certificates</h1>
                            <p className="text-gray-500">View and download your earned certificates</p>
                        </div>
                    </div>
                </div>

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12">
                        <Empty
                            description={
                                <div className="text-center">
                                    <p className="text-gray-500 text-lg">No certificates yet</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Complete courses and exams to earn certificates
                                    </p>
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                            >
                                {/* Certificate Preview */}
                                <div className="relative h-48 bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center border-b-4 border-amber-300">
                                    {/* Decorative corners */}
                                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl"></div>
                                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr"></div>
                                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl"></div>
                                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br"></div>

                                    <div className="text-center">
                                        <FaCertificate className="text-amber-500 text-5xl mx-auto mb-2" />
                                        <p className="text-amber-800 font-serif font-bold text-lg">CERTIFICATE</p>
                                        <p className="text-amber-600 text-xs tracking-widest">OF ACHIEVEMENT</p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        {cert.isValid ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                Valid
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                                Invalid
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Certificate Info */}
                                <div className="p-5">
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Certificate No.</p>
                                        <p className="font-mono text-sm font-semibold text-gray-700">{cert.certificateNumber.slice(0, 8).toLocaleUpperCase()}</p>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                                        <p className="text-sm font-semibold text-teal-600">{subjectNames[cert.subjectId] || 'Loading...'}</p>
                                    </div>

                                    <div className="mb-5">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Issued On</p>
                                        <p className="text-sm text-gray-600">{formatDate(cert.issueDate)}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleViewCertificate(cert)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors text-sm"
                                        >
                                            <FaEye />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(cert)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                                        >
                                            <FaDownload />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Certificate Detail Modal */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                {selectedCertificate && (
                    <div className="py-4">
                        <CertificateCard
                            certificate={selectedCertificate}
                            studentName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student' : 'Student'}
                            subjectName={subjectNames[selectedCertificate.subjectId] || 'Certificate'}
                            onDownload={() => handleDownload(selectedCertificate)}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyCertificatesPage;
