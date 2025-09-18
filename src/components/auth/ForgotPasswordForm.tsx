import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '~/hooks/useAuth';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPasswordForm = () => {
    const { forgotPassword } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        forgotPassword(values.email);
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-4 py-2 font-bold text-white bg-backgroundColor rounded-md hover:scale-101 transform transition-all duration-300 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;