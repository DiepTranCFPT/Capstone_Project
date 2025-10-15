import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from '~/components/common/Toast';

const OtpVerificationSchema = Yup.object().shape({
    otp: Yup.string()
        .length(6, 'OTP must be exactly 6 digits')
        .matches(/^\d{6}$/, 'OTP must contain only numbers')
        .required('OTP is required'),
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

const OtpVerificationForm = () => {
    const { verifyOtp, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get email from URL parameters
    const email = searchParams.get('email') || '';

    const handleSubmit = async (values: { otp: string; newPassword: string; confirmPassword: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        try {
            await verifyOtp(email, values.otp, values.newPassword);
            toast.success('Password has been reset successfully! Please login with your new password.');
            navigate('/auth');
        } catch {
            toast.error('Invalid OTP or password reset failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!email) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600">Invalid Link</h2>
                        <p className="mt-2 text-gray-600">Email parameter is missing. Please use the link from your email.</p>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="mt-4 px-4 py-2 font-bold text-white bg-backgroundColor rounded-md hover:scale-101 transform transition-all duration-300"
                        >
                            Request New Reset Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Verify OTP</h2>
                    <p className="mt-2 text-gray-600">
                        Enter the 6-digit OTP sent to <strong>{email}</strong>
                    </p>
                </div>

                <Formik
                    initialValues={{ otp: '', newPassword: '', confirmPassword: '' }}
                    validationSchema={OtpVerificationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    OTP Code
                                </label>
                                <Field
                                    name="otp"
                                    type="text"
                                    maxLength={6}
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                                    placeholder="123456"
                                    style={{ letterSpacing: '0.5em' }}
                                />
                                <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Field
                                        name="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Field
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full px-4 py-2 font-bold text-white bg-backgroundColor rounded-md hover:scale-101 transform transition-all duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting || loading ? 'Verifying...' : 'Reset Password'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive the OTP?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/auth/forgot-password')}
                            className="text-backgroundColor hover:text-blue-700 font-medium"
                        >
                            Request again
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationForm;
