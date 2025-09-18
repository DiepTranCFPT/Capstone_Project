import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Password too short! - should be 6 chars minimum').required('Required'),
});

interface LoginFormProps {
    buttonClasses: string;
    // buttonForGFT: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ buttonClasses }) => {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (values: { email: string; password: string }) => {
        const response = await login(values.email, values.password);
        console.log(response);
        navigate('/');
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100">
            <div className="p-6 space-y-6 md:space-y-7 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-backgroundColor md:text-2xl text-center">
                    Welcome Back
                    <p className="text-sm font-normal text-gray-500 mt-1">
                        Sign in to your account
                    </p>
                </h1>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={LoginSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values);
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-5 md:space-y-6">
                            <div className="relative">
                                {/* Icon */}
                                <Field
                                    name="email"
                                    type="email"
                                    className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full pl-4 p-3 transition-all duration-200 shadow-sm"
                                    placeholder="Email address"
                                />
                                <ErrorMessage name='email' component='div' className='text-red-500 text-sm mt-1 italic' />
                            </div>
                            <div className="relative">
                                <div className="relative">
                                    {/* Icon */}
                                    <Field
                                        name='password'
                                        type={showPassword ? 'text' : 'password'}
                                        className="border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full pl-4 p-3 transition-all duration-200 shadow-sm"
                                        placeholder='Password'
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
                                <ErrorMessage name='password' component='div' className='text-red-500 text-sm mt-1 italic' />
                            </div>


                            <div className="flex items-center justify-between">
                                {/* Remember me & Forgot password */}
                                <div className='flex items-center gap-2'>

                                    <Field
                                        id="remember-me"
                                        name="rememberMe"
                                        type="checkbox"
                                        className="mt-2"
                                    />
                                    <label htmlFor="remember-me" className="block text-sm font-medium text-gray-600">Remember me</label>
                                </div>
                                <div>
                                    <a href="forgot-password" className="text-sm font-medium text-brightColor hover:underline">Forgot password?</a>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className={buttonClasses}>
                                {isSubmitting ? 'Logging in...' : 'Sign in'}
                            </button>
                        </Form>
                    )}
                </Formik>
                {/* Social buttons and other links */}
            </div>
        </div>
    )
}

export default LoginForm;