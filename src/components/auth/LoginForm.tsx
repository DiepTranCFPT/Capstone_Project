import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';
import { toast, authMessages } from '~/components/common/Toast';
import google from '/google-icon.svg';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(4, 'Password too short! - should be 6 chars minimum').required('Required'),
});

interface LoginFormProps {
    buttonClasses: string;
    // buttonForGFT: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ buttonClasses }) => {
    const { login, user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: { email: string; password: string }) => {
        const response = await login(values.email, values.password);
        if (!response) {
            toast.success(authMessages.login.success);
        } else {

            toast.error(authMessages.login.error);
        }
    };

    const handleGoogleLogin = () => {
        const OAuthConfig = {
            redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
            authUri: import.meta.env.VITE_AUTH_URI,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
        };

        const callbackUrl = OAuthConfig.redirectUri;
        const authUrl = OAuthConfig.authUri;
        const googleClientId = OAuthConfig.clientId;

        const googleAuthUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
            callbackUrl
        )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

        // Chuyển hướng người dùng
        window.location.href = googleAuthUrl;
    };

    // Redirect based on user role after successful login
    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'USER':
                    navigate('/');
                    break;
                case 'TEACHER':
                    navigate('/teacher/dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin'); // Assuming an admin dashboard exists
                    break;
                case 'ACADEMIC_ADVISOR':
                    navigate('/academic-advisor/dashboard'); // Assuming an academic advisor dashboard exists
                    break;
                case 'PARENT':
                    navigate('/parent/dashboard'); // Assuming a parent dashboard exists
                    break;
                default:
                    navigate('/'); // Default redirect
                    break;
            }
        }
    }, [user, navigate]);

    // Show Google login error if redirected from Google callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorMessage = urlParams.get('message');

        if (error === 'google_auth_failed' && errorMessage) {
            toast.error(decodeURIComponent(errorMessage));
            // Clean URL after showing error
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

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
                    onSubmit={async (values, { setSubmitting }) => {
                        setSubmitting(true);
                        await handleSubmit(values);
                        setSubmitting(false); // Set to false after handling the submission
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
                                <div className='flex items-center justify-center gap-2'>
                                    <div>
                                        <Field
                                            id="remember-me"
                                            name="rememberMe"
                                            type="checkbox"
                                            className="mt-2"
                                        />
                                    </div>
                                    <label htmlFor="remember-me" className="block text-sm font-medium text-gray-600">Remember me</label>
                                </div>
                                <div>
                                    <a href="forgot-password" className="text-sm font-medium text-brightColor hover:underline">Forgot password?</a>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className={buttonClasses}>
                                <div className='flex justify-center items-center gap-2'>
                                    {isSubmitting ? 'Logging in...' : 'Sign in'}

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
                <div className="flex items-center my-6">
                    <div className="flex-grow h-px bg-gray-200" />
                    <span className="mx-3 text-gray-900 text-sm">or</span>
                    <div className="flex-grow h-px bg-gray-200" />
                </div>
                {/* Social buttons and other links */}
                <div
                    onClick={handleGoogleLogin}
                    className='flex justify-center items-center gap-3 border border-gray-300 py-2.5 px-4 rounded-lg hover:cursor-pointer
                 hover:scale-101 transform transition-all duration-200 hover:border-backgroundColor'>
                    <img src={google} alt="Google logo" width={30} />
                    <span className='text-gray-600'>Sign in with Google</span>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;
