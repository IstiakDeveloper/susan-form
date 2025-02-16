import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';

export default function Show({ form }) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const key = e.target.name;
        let value = e.target.value;

        // Handle different input types
        if (e.target.type === 'file') {
            value = e.target.files[0];
        } else if (e.target.type === 'checkbox') {
            const currentValues = values[key] || [];
            if (e.target.checked) {
                value = [...currentValues, e.target.value];
            } else {
                value = currentValues.filter(v => v !== e.target.value);
            }
        }

        setValues(values => ({
            ...values,
            [key]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Create FormData for file uploads
        const formData = new FormData();
        Object.keys(values).forEach(key => {
            if (values[key] instanceof File) {
                formData.append(key, values[key]);
            } else if (Array.isArray(values[key])) {
                values[key].forEach(value => {
                    formData.append(`${key}[]`, value);
                });
            } else {
                formData.append(key, values[key]);
            }
        });

        router.post(route('forms.public.submit', form.slug), formData, {
            onSuccess: () => {
                setProcessing(false);
                setSubmitted(true);
                setValues({});
                setErrors({});
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
            }
        });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="text-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Thank you for your submission!
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Your response has been recorded.
                                    </p>
                                </div>
                                <div className="mt-5">
                                <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                    >
                                        Submit another response
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{form.title}</title>
            </Head>

            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">
                                {form.title}
                            </h1>
                            {form.description && (
                                <p className="text-gray-600 mb-6">{form.description}</p>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {form.fields.map((field) => (
                                    <div key={field.id}>
                                        <label
                                            htmlFor={field.name}
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            {field.label}
                                            {field.is_required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>

                                        {/* Text Input */}
                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                placeholder={field.placeholder}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        )}

                                        {/* Textarea */}
                                        {field.type === 'textarea' && (
                                            <textarea
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                placeholder={field.placeholder}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        )}

                                        {/* Email Input */}
                                        {field.type === 'email' && (
                                            <input
                                                type="email"
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                placeholder={field.placeholder}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        )}

                                        {/* Number Input */}
                                        {field.type === 'number' && (
                                            <input
                                                type="number"
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                placeholder={field.placeholder}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        )}

                                        {/* Date Input */}
                                        {field.type === 'date' && (
                                            <input
                                                type="date"
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        )}

                                        {/* Select Dropdown */}
                                        {field.type === 'select' && (
                                            <select
                                                name={field.name}
                                                id={field.name}
                                                value={values[field.name] || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">Select an option</option>
                                                {field.options.map((option, index) => (
                                                    <option key={index} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {/* Radio Buttons */}
                                        {field.type === 'radio' && (
                                            <div className="mt-2 space-y-2">
                                                {field.options.map((option, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id={`${field.name}-${index}`}
                                                            name={field.name}
                                                            value={option.value}
                                                            checked={values[field.name] === option.value}
                                                            onChange={handleChange}
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
                                        )}

                                        {/* Checkboxes */}
                                        {field.type === 'checkbox' && (
                                            <div className="mt-2 space-y-2">
                                                {field.options.map((option, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`${field.name}-${index}`}
                                                            name={field.name}
                                                            value={option.value}
                                                            checked={(values[field.name] || []).includes(option.value)}
                                                            onChange={handleChange}
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
                                        )}

                                        {/* File Upload */}
                                        {field.type === 'file' && (
                                            <input
                                                type="file"
                                                name={field.name}
                                                id={field.name}
                                                onChange={handleChange}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        )}

                                        {/* Help Text */}
                                        {field.help_text && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                {field.help_text}
                                            </p>
                                        )}

                                        {/* Error Message */}
                                        {errors[field.name] && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors[field.name]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
