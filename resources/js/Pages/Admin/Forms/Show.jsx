import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ClipboardIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function Show({ form, shareableLink }) {
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    const copyShareableLink = () => {
        navigator.clipboard.writeText(shareableLink);
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
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
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Edit Form
                        </Link>
                        <button
                            onClick={copyShareableLink}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            {showCopiedMessage ? (
                                <>
                                    <CheckIcon className="h-5 w-5 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <ClipboardIcon className="h-5 w-5 mr-2" />
                                    Copy Share Link
                                </>
                            )}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Form Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Form Details</h3>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Status</label>
                                            <div className="mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    form.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {form.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        {form.description && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Description</label>
                                                <p className="mt-1 text-sm text-gray-900">{form.description}</p>
                                            </div>
                                        )}
                                        {form.expires_at && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500">Expires At</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {new Date(form.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Sharing</h3>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-500">Public Form URL</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                URL
                                            </span>
                                            <input
                                                type="text"
                                                value={shareableLink}
                                                readOnly
                                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields Preview */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Form Preview</h3>
                            <div className="space-y-6">
                                {form.fields.map((field) => (
                                    <div key={field.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-md font-medium text-gray-900">{field.label}</h4>
                                                <p className="text-sm text-gray-500">Type: {field.type}</p>
                                            </div>
                                            {field.is_required && (
                                                <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        {/* Field Preview */}
                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                disabled
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                            />
                                        )}

                                        {field.type === 'textarea' && (
                                            <textarea
                                                placeholder={field.placeholder}
                                                disabled
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                            />
                                        )}

                                        {field.type === 'select' && (
                                            <select
                                                disabled
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                            >
                                                <option value="">{field.placeholder || 'Select an option'}</option>
                                                {field.options.map((option, index) => (
                                                    <option key={index} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {field.type === 'radio' && (
                                            <div className="mt-2 space-y-2">
                                                {field.options.map((option, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            disabled
                                                            className="h-4 w-4 border-gray-300 text-gray-400"
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-700">
                                                            {option.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {field.type === 'checkbox' && (
                                            <div className="mt-2 space-y-2">
                                                {field.options.map((option, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            disabled
                                                            className="h-4 w-4 rounded border-gray-300 text-gray-400"
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-700">
                                                            {option.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {field.type === 'file' && (
                                            <input
                                                type="file"
                                                disabled
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-400 hover:file:bg-gray-100"
                                            />
                                        )}

                                        {field.help_text && (
                                            <p className="mt-2 text-sm text-gray-500">{field.help_text}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
