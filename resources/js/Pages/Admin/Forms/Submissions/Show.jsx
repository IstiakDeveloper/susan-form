import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    EnvelopeIcon,
    DevicePhoneMobileIcon,
    GlobeAltIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Show({ form, submission }) {
    // Status icon and color mapping
    const getStatusInfo = (status) => {
        switch (status) {
            case 'reviewed':
                return {
                    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
                    color: 'text-green-800 bg-green-100',
                    label: 'Reviewed'
                };
            case 'pending':
                return {
                    icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />,
                    color: 'text-yellow-800 bg-yellow-100',
                    label: 'Pending'
                };
            case 'spam':
                return {
                    icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
                    color: 'text-red-800 bg-red-100',
                    label: 'Spam'
                };
            default:
                return {
                    icon: null,
                    color: 'text-gray-800 bg-gray-100',
                    label: 'Unknown'
                };
        }
    };

    // Generate PDF download
    const handlePDFDownload = () => {
        const doc = new jsPDF();

        // Title and basic info
        doc.setFontSize(18);
        doc.text(`Submission Details: ${form.title}`, 14, 22);

        doc.setFontSize(10);
        doc.text(`Submission Date: ${format(new Date(submission.created_at), 'PPP p')}`, 14, 30);
        doc.text(`Submission Status: ${submission.status}`, 14, 36);

        // Submission data table
        const tableColumn = ["Field", "Value"];
        const tableRows = form.fields.map(field => [
            field.label,
            submission.data[field.name] || 'N/A'
        ]);

        doc.autoTable({
            startY: 45,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { fontStyle: 'bold' }
            }
        });

        // Submitter info section
        doc.setFontSize(10);
        doc.text('Submitter Information', 14, doc.autoTable.previous.finalY + 10);
        doc.text(`IP Address: ${submission.submitter_ip}`, 14, doc.autoTable.previous.finalY + 16);
        if (submission.submitter_email) {
            doc.text(`Email: ${submission.submitter_email}`, 14, doc.autoTable.previous.finalY + 22);
        }

        doc.save(`${form.title}-submission-${submission.id}.pdf`);
    };

    const statusInfo = getStatusInfo(submission.status);

    return (
        <AdminLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Submission Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Detailed view of form submission
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href={route('admin.forms.submissions.index', form.id)}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Back to Submissions
                        </Link>
                        <button
                            onClick={handlePDFDownload}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Download PDF
                        </button>
                    </div>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 space-y-6">
                            {/* Submission Status */}
                            <div className="flex items-center space-x-4 mb-6">
                                {statusInfo.icon}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            {/* Submission Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Form Fields */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Submission Data
                                    </h3>
                                    <div className="space-y-4">
                                        {form.fields.map((field) => (
                                            <div
                                                key={field.id}
                                                className="bg-gray-50 p-4 rounded-lg"
                                            >
                                                <p className="text-sm font-medium text-gray-600 mb-1">
                                                    {field.label}
                                                </p>
                                                <p className="text-gray-900 font-semibold">
                                                    {submission.data[field.name] || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submitter Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Submitter Information
                                    </h3>
                                    <div className="bg-white border rounded-lg divide-y">
                                        {/* Submission Date */}
                                        <div className="flex items-center p-4 space-x-4">
                                            <ClockIcon className="h-6 w-6 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">Submission Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {format(new Date(submission.created_at), 'PPP p')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* IP Address */}
                                        <div className="flex items-center p-4 space-x-4">
                                            <GlobeAltIcon className="h-6 w-6 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">IP Address</p>
                                                <p className="font-medium text-gray-900">
                                                    {submission.submitter_ip}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Email (if available) */}
                                        {submission.submitter_email && (
                                            <div className="flex items-center p-4 space-x-4">
                                                <EnvelopeIcon className="h-6 w-6 text-gray-500" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Email</p>
                                                    <p className="font-medium text-gray-900">
                                                        {submission.submitter_email}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
