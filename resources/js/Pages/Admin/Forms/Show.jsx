import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ClipboardIcon,
    CheckIcon,
    PencilIcon,
    LinkIcon,
    DocumentDuplicateIcon,
    EyeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Show({ form, shareableLink }) {
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const linkInputRef = useRef(null);

    const copyShareableLink = () => {
        linkInputRef.current.select();
        navigator.clipboard.writeText(shareableLink).then(() => {
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
        });
    };

    // Render different field types
    const renderFieldPreview = (field) => {
        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        placeholder={field.placeholder || 'Enter text'}
                        disabled
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        placeholder={field.placeholder || 'Enter your message'}
                        disabled
                        rows={4}
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    />
                );

            case 'email':
                return (
                    <input
                        type="email"
                        placeholder={field.placeholder || 'Enter email'}
                        disabled
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        placeholder={field.placeholder || 'Enter number'}
                        disabled
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        disabled
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    />
                );

            case 'select':
                return (
                    <select
                        disabled
                        className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                    >
                        <option value="">
                            {field.placeholder || 'Select an option'}
                        </option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div className="mt-2 space-y-2">
                        {field.options?.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`${field.name}-${index}`}
                                    name={field.name}
                                    disabled
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                    htmlFor={`${field.name}-${index}`}
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="mt-2 space-y-2">
                        {field.options?.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${field.name}-${index}`}
                                    name={field.name}
                                    disabled
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label
                                    htmlFor={`${field.name}-${index}`}
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'file':
                return (
                    <div className="mt-2 relative">
                        <input
                            type="file"
                            disabled
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gray-50 file:text-gray-700
                            hover:file:bg-gray-100"
                        />
                    </div>
                );

            case 'signature':
                return (
                    <div className="mt-2 bg-gray-50 p-4 rounded-md text-center">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            Signature Field Placeholder
                        </p>
                    </div>
                );

            default:
                return (
                    <p className="text-sm text-gray-500 mt-2">
                        Unsupported field type
                    </p>
                );
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Form Preview: {form.title}
                    </h2>
                    <div className="flex space-x-4">
                        <Link
                            href={route('admin.forms.edit', form.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Edit Form
                        </Link>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Form Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white overflow-hidden shadow-lg sm:rounded-lg"
                    >
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Form Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                                        Form Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                                Status
                                            </label>
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-medium
                                                ${form.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}
                                            `}>
                                                {form.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {form.description && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    Description
                                                </label>
                                                <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                                                    {form.description}
                                                </p>
                                            </div>
                                        )}

                                        {form.expires_at && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    Expiration Date
                                                </label>
                                                <p className="text-gray-800 flex items-center">
                                                    <LinkIcon className="h-5 w-5 mr-2 text-gray-500" />
                                                    {new Date(form.expires_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sharing Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                                        Share Form
                                    </h3>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Public Form URL
                                        </label>
                                        <div className="flex">
                                            <input
                                                ref={linkInputRef}
                                                type="text"
                                                value={shareableLink}
                                                readOnly
                                                className="flex-grow px-3 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={copyShareableLink}
                                                className={`
                                                    px-4 py-2 border border-l-0 rounded-r-md
                                                    transition-all duration-200
                                                    ${showCopiedMessage
                                                        ? 'bg-green-500 text-white border-green-500'
                                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}
                                                `}
                                            >
                                                {showCopiedMessage ? (
                                                    <CheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <DocumentDuplicateIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {showCopiedMessage && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs text-green-600 mt-2"
                                            >
                                                Link copied to clipboard!
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Fields Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white overflow-hidden shadow-lg sm:rounded-lg"
                    >
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-6">
                                Form Fields Preview
                            </h3>
                            <div className="space-y-6">
                                {form.fields.map((field) => (
                                    <motion.div
                                        key={field.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <h4 className="text-md font-semibold text-gray-900">
                                                    {field.label}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Type: {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                                </p>
                                            </div>
                                            {field.is_required && (
                                                <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        {/* Field Preview */}
                                        {renderFieldPreview(field)}

                                        {/* Help Text */}
                                        {field.help_text && (
                                            <p className="mt-2 text-xs text-gray-500 italic">
                                                <EyeIcon className="h-4 w-4 inline-block mr-1 -mt-1" />
                                                {field.help_text}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
