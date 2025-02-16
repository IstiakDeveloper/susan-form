import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    format, parseISO
} from 'date-fns';
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    FolderPlusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormsIndex({
    forms,
    filters,
    analytics
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [showRecentSubmissions, setShowRecentSubmissions] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        status: filters.status || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        submissions_min: filters.submissions_min || '',
        submissions_max: filters.submissions_max || '',
        sort: filters.sort || 'created_at',
        direction: filters.direction || 'desc',
        per_page: filters.per_page || 10
    });

    // Add the handleFilterChange method
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add applyFilters method
    const applyFilters = () => {
        router.get(route('admin.forms.index'), localFilters, {
            preserveState: true,
            replace: true
        });
    };

    // Add resetFilters method
    const resetFilters = () => {
        setLocalFilters({
            search: '',
            status: '',
            date_from: '',
            date_to: '',
            submissions_min: '',
            submissions_max: '',
            sort: 'created_at',
            direction: 'desc',
            per_page: 10
        });
        router.get(route('admin.forms.index'));
    };

    // Add handleDeleteForm method
    const handleDeleteForm = (formId) => {
        if (confirm('Are you sure you want to delete this form? All associated submissions will also be deleted.')) {
            router.delete(route('admin.forms.destroy', formId), {
                preserveScroll: true,
                onSuccess: () => {
                    // Optional: Add toast notification
                }
            });
        }
    };

    // Add handleSort method
    const handleSort = (field) => {
        const direction = localFilters.sort === field && localFilters.direction === 'asc'
            ? 'desc'
            : 'asc';

        router.get(route('admin.forms.index'), {
            ...localFilters,
            sort: field,
            direction: direction
        }, {
            preserveState: true,
            replace: true
        });
    };


    return (
        <AdminLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Form Management
                    </h2>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                        >
                            <FunnelIcon className="h-5 w-5 mr-2" />
                            Filters
                        </button>
                        <Link
                            href={route('admin.forms.create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <FolderPlusIcon className="h-5 w-5 mr-2" />
                            Create New Form
                        </Link>
                    </div>
                </div>
            }
        >
            {/* Filters Section */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 p-6 border-b"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Search Forms
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="search"
                                        value={localFilters.search}
                                        onChange={handleFilterChange}
                                        placeholder="Search by title or description"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                    <MagnifyingGlassIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={localFilters.status}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="expiring_soon">Expiring Soon</option>
                                </select>
                            </div>

                            {/* Submissions Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Submissions Range
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="submissions_min"
                                        value={localFilters.submissions_min}
                                        onChange={handleFilterChange}
                                        placeholder="Min"
                                        className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm"
                                    />
                                    <input
                                        type="number"
                                        name="submissions_max"
                                        value={localFilters.submissions_max}
                                        onChange={handleFilterChange}
                                        placeholder="Max"
                                        className="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="flex space-x-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        name="date_from"
                                        value={localFilters.date_from}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        name="date_to"
                                        value={localFilters.date_to}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2" />
                                Reset
                            </button>
                            <button
                                onClick={applyFilters}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Analytics Overview */}
            <div className="bg-white shadow-sm sm:rounded-lg m-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Total Forms</h3>
                        <p className="text-2xl font-bold text-gray-900">
                            {analytics.total_forms}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Active Forms</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {analytics.active_forms}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {analytics.total_submissions}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Recent Submissions</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {analytics.recent_submissions.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Forms Table */}
            <div className="px-6 pb-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        { key: 'title', label: 'Title' },
                                        { key: 'status', label: 'Status' },
                                        { key: 'submissions_count', label: 'Submissions' },
                                        { key: 'created_at', label: 'Created' },
                                        { key: 'actions', label: 'Actions' }
                                    ].map((header) => (
                                        <th
                                            key={header.key}
                                            className={`
                                                px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                                                ${header.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''}
                                            `}
                                            onClick={() =>
                                                header.key !== 'actions' && header.key !== 'status'
                                                    ? handleSort(header.key)
                                                    : null
                                            }
                                        >
                                            {header.label}
                                            {header.key !== 'actions' && header.key !== 'status' && (
                                                <span className="ml-2">
                                                    {localFilters.sort === header.key && (
                                                        localFilters.direction === 'asc' ? '▲' : '▼'
                                                    )}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {forms.data.map((form) => (
                                    <tr key={form.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {form.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {form.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`
                                                px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${form.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}
                                            `}>
                                                {form.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            {form.expires_at && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Expires: {format(new Date(form.expires_at), 'PPP')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Link
                                                href={route('admin.forms.submissions.index', form.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {form.submissions_count} responses
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(form.created_at), 'PPP')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <Link
                                                    href={route('admin.forms.show', form.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Form"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={route('admin.forms.edit', form.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit Form"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteForm(form.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Form"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(forms.current_page - 1) * forms.per_page + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(forms.current_page * forms.per_page, forms.total)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{forms.total}</span>{' '}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {forms.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`
                                                relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${link.active
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}
                                                ${index === 0 ? 'rounded-l-md' : ''}
                                                ${index === forms.links.length - 1 ? 'rounded-r-md' : ''}
                                            `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Submissions Modal */}
            {showRecentSubmissions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Recent Submissions
                            </h2>
                            <button
                                onClick={() => setShowRecentSubmissions(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {analytics.recent_submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="bg-gray-50 p-4 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {submission.form.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(submission.created_at), 'PPP p')}
                                            </p>
                                        </div>
                                        <span
                                            className={`
                                                px-2 py-1 rounded-full text-xs
                                                ${submission.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : submission.status === 'reviewed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}
                                            `}
                                        >
                                            {submission.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
