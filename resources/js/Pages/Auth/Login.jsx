import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    LockClosedIcon,
    EnvelopeIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-12">
            <Head title="Login" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.3,
                    type: "spring"
                }}
                className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden"
            >
                <div className="px-8 py-10">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <LockClosedIcon className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg"
                        >
                            {status}
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="pl-10 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="pl-10 pr-10 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Signing In...' : 'Sign In'}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
