import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
});

const ResetPasswordForm = () => {
    const { resetPassword } = useAuth();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <Formik
                    initialValues={{ password: '', confirmPassword: '' }}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        if (token) {
                            resetPassword(token, values.password);
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className='relative'>
                                    <Field
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm hover:border-backgroundColor"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className='relative'>
                                    <Field
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm hover:border-backgroundColor"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
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
                                disabled={isSubmitting}
                                className="w-full px-4 py-2 font-bold text-white bg-backgroundColor rounded-md hover:scale-101 transform transition-all duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
