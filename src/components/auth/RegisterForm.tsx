import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';
import { toast, authMessages } from '~/components/common/Toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Name too short! - should be 2 chars minimum').required('Required'),
    lastName: Yup.string().min(2, 'Name too short! - should be 2 chars minimum').required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Password too short! - should be 6 chars minimum').required('Required'),
    dob: Yup.date().required('Required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),

});

interface RegisterFormProps {
    buttonClasses: string;
    // buttonForGFT: string;
}
const RegisterForm: React.FC<RegisterFormProps> = ({ buttonClasses }) => {
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (values: { firstName: string; lastName: string; email: string; password: string; dob: Date; confirmPassword: string }) => {
        try {
            await register(values.email, values.password, values.firstName, values.lastName, values.dob);
            toast.success(authMessages.register.success);
            // Redirect to email verification pending page instead of login
            // window.location.href = '/auth?verification=pending';
        } catch {
            toast.error(authMessages.register.error);
        }
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100">
            <div className="p-6 space-y-6 md:space-y-7 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-backgroundColor md:text-2xl text-center">
                    Create Account
                    <p className="text-sm font-normal text-gray-500 mt-1">
                        Sign up to get started
                    </p>
                </h1>
                <Formik
                    initialValues={{ firstName: '', lastName: '', dob: new Date(), email: '', password: '', confirmPassword: '' }}
                    validationSchema={RegisterSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values);
                        setSubmitting(true);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-5 md:space-y-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <Field
                                    name="firstName"
                                    type="text"
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                                <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Lats Name
                                </label>
                                <Field
                                    name="lastName"
                                    type="text"
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                                <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                                    Day of Birth
                                </label>
                                <Field
                                    name="dob"
                                    type="date"
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name="dob" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Field
                                    name="email"
                                    type="email"
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="you@example.com"
                                />
                                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600 italic" />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <div className='relative'>
                                    <Field
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
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
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm Password
                                </label>
                                <div className='relative'>
                                    <Field
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600 italic"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={buttonClasses}
                            >
                                <div className='flex justify-center items-center gap-2'>
                                    {isSubmitting ? 'Registering...' : 'Register'}

                                    {isSubmitting &&
                                        <div role="status">
                                            <svg aria-hidden="true" className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                            </svg>
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    }
                                </div>
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default RegisterForm
