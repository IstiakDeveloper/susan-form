import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function Create() {
    const [values, setValues] = useState({
        title: '',
        description: '',
        is_active: true,
        expires_at: ''
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        setValues(values => ({
            ...values,
            [key]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route('admin.forms.store'), values, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
            }
        });
    };

    return (
        <AdminLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create New Form
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Form Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={values.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Enter form title"
                                />
                                {errors.title && <InputError message={errors.title} className="mt-2" />}
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={values.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Enter form description"
                                />
                                {errors.description && <InputError message={errors.description} className="mt-2" />}
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={values.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="is_active" className="font-medium text-gray-700">
                                        Active
                                    </label>
                                    <p className="text-gray-500">Make this form available for submissions</p>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="expires_at"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Expiration Date
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        id="expires_at"
                                        value={values.expires_at}
                                        onChange={handleChange}
                                        className="block w-full pl-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Leave blank for no expiration
                                </p>
                                {errors.expires_at && <InputError message={errors.expires_at} className="mt-2" />}
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => router.get(route('admin.forms.index'))}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Form'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
