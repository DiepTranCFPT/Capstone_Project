import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail, error } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verifyEmailToken = async () => {
            // Prevent multiple verification attempts
            if (verificationAttempted.current) {
                console.log('Verification already attempted, skipping...');
                return;
            }

            const email = searchParams.get('email');
            const token = searchParams.get('token');

            console.log('VerifyEmailPage: Starting verification', {
                hasEmail: !!email,
                hasToken: !!token,
                email,
                verificationAttempted: verificationAttempted.current
            });

            if (!email || !token) {
                console.error('VerifyEmailPage: Missing email or token', { email: !!email, token: !!token });
                setVerificationStatus('error');
                return;
            }

            verificationAttempted.current = true;

            try {
                await verifyEmail(email, token);
                setVerificationStatus('success');
                console.log('VerifyEmailPage: Verification successful');
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            } catch (error) {
                console.error('VerifyEmailPage: Verification failed', error);
                setVerificationStatus('error');
            }
        };

        verifyEmailToken();
    }, [searchParams, verifyEmail, navigate]);

    const renderContent = () => {
        switch (verificationStatus) {
            case 'verifying':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
                        <p className="text-gray-500 text-center">
                            Please wait while we verify your email address.
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <FaCheckCircle className="text-6xl text-green-500" />
                        <h2 className="text-2xl font-bold text-green-600">Email Verified Successfully!</h2>
                        <p className="text-gray-600 text-center max-w-md">
                            Your email has been verified. You can now log in to your account.
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to login page in 3 seconds...
                        </p>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <FaTimesCircle className="text-6xl text-red-500" />
                        <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                        <div className="text-gray-600 text-center max-w-md space-y-2">
                            <p>
                                {error || 'The verification link is invalid or has expired.'}
                            </p>
                            <details className="text-sm text-gray-500">
                                <summary className="cursor-pointer hover:text-gray-700">
                                    Technical Details
                                </summary>
                                <p className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                                    Status: 401 Unauthorized<br/>
                                    Endpoint: /api/v1/auth/verify-email<br/>
                                    This usually means the verification token is invalid, expired, or has already been used.
                                </p>
                            </details>
                        </div>
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-6 py-2 bg-backgroundColor text-white rounded-md hover:cursor-pointer hover:scale-105 transform transition-all duration-400"
                        >
                            Go to Login
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
