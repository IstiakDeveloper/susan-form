import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import Pagination from '@/Components/Pagination';
import {
    EyeIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function Index({ form, submissions }) {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'reviewed':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'spam':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'reviewed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'spam':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = (submissionId, newStatus) => {
        router.put(
            route('admin.forms.submissions.update', [form.id, submissionId]),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    console.error('Status update failed', errors);
                }
            }
        );
    };

    const handleSubmissionDelete = (submissionId) => {
        if (confirm('Are you sure you want to delete this submission?')) {
            router.delete(
                route('admin.forms.submissions.destroy', [form.id, submissionId]),
                {
                    preserveScroll: true,
                    preserveState: true
                }
            );
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Submissions for: {form.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            View and manage form submissions
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href={route('admin.forms.index')}
                            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                        >
                            Back to Forms
                        </Link>
                        <Link
                            href={route('admin.forms.submissions.export', form.id)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Export CSV
                        </Link>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Submitter
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {submissions.data.map((submission) => (
                                            <tr key={submission.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(submission.status)}
                                                        <span
                                                            className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}
                                                        >
                                                            {submission.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        {submission.submitter_email ? (
                                                            <>
                                                                <div className="font-medium text-gray-900">
                                                                    {submission.submitter_email}
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    IP: {submission.submitter_ip}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-gray-500">
                                                                IP: {submission.submitter_ip}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(submission.created_at), 'PPP p')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-4">
                                                        <Link
                                                            href={route('admin.forms.submissions.show', [form.id, submission.id])}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </Link>
                                                        <div className="relative">
                                                            <select
                                                                value={submission.status}
                                                                onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                                                                className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="reviewed">Reviewed</option>
                                                                <option value="spam">Spam</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            onClick={() => handleSubmissionDelete(submission.id)}
                                                            className="text-red-600 hover:text-red-900"
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

                            <div className="mt-6">
                                <Pagination links={submissions.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
