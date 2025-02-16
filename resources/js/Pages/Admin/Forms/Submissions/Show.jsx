import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function SubmissionDetailsPage({ form, submission }) {
    // File and image preview modal state
    const [previewFile, setPreviewFile] = useState(null);

    // Status configuration
    const statusConfigs = {
        reviewed: {
            icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
            className: "bg-green-50 text-green-800 border-green-200",
            label: "Reviewed",
        },
        pending: {
            icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />,
            className: "bg-yellow-50 text-yellow-800 border-yellow-200",
            label: "Pending Review",
        },
        spam: {
            icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
            className: "bg-red-50 text-red-800 border-red-200",
            label: "Marked as Spam",
        },
    };

    // Determine current status
    const currentStatus = statusConfigs[submission.status] || {
        icon: null,
        className: "bg-gray-50 text-gray-800 border-gray-200",
        label: "Unclassified",
    };

    // Render signature field
    const renderSignatureField = (field) => {
        const signatureData = submission.data[field.name];

        // Handle array of signatures or single signature
        const signatures = Array.isArray(signatureData)
            ? signatureData
            : [signatureData];

        // If no signature data, show not provided message
        if (!signatures || signatures.length === 0 || !signatures[0]) {
            return (
                <div className="text-gray-500 italic flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                    No signature provided
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {signatures.map((signature, index) => {
                    // Ensure signature is an object and has a signature property
                    if (!signature || typeof signature !== "object") {
                        return null;
                    }

                    // Normalize signature path
                    const signaturePath = signature.signature
                        ? signature.signature.startsWith("storage/")
                            ? `/${signature.signature}`
                            : signature.signature
                        : null;

                    return (
                        <div
                            key={index}
                            className="space-y-4 border-b pb-4 last:border-b-0"
                        >
                            {/* Signature Image */}
                            {signaturePath ? (
                                <div className="border-2 border-gray-300 rounded-lg p-2">
                                    <img
                                        src={signaturePath}
                                        alt="Signature"
                                        className="max-w-full h-32 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-500 italic flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    Signature not available
                                </div>
                            )}

                            {/* Additional Signature Details */}
                            <div className="space-y-2">
                                {signature.printed_name && (
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Printed Name:
                                        </p>
                                        <p className="font-medium">
                                            {signature.printed_name}
                                        </p>
                                    </div>
                                )}

                                {signature.date && (
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Date:
                                        </p>
                                        <p className="font-medium">
                                            {format(
                                                new Date(signature.date),
                                                "PPP"
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderFileField = (field) => {
        const fileValue = submission.data[field.name];

        // Handle no file scenario
        if (!fileValue)
            return (
                <div className="text-gray-500 italic flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                    No file uploaded
                </div>
            );

        // Determine if it's an image
        const isImage =
            typeof fileValue === "string" &&
            fileValue.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg|webp)$/i);

        // Safe file download/preview handler
        const handleFileInteraction = () => {
            if (isImage) {
                setPreviewFile(fileValue);
            } else {
                // For non-image files, use window.open for safe external link
                window.open(fileValue, "_blank", "noopener,noreferrer");
            }
        };

        return (
            <button
                onClick={handleFileInteraction}
                className="flex items-center text-blue-600 hover:text-blue-800"
            >
                {isImage ? (
                    <>
                        <EyeIcon className="h-5 w-5 mr-2" />
                        Preview Image
                    </>
                ) : (
                    <>
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Download File
                    </>
                )}
            </button>
        );
    };

    // PDF Generation
    const handlePDFDownload = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(`Submission Details: ${form.title}`, 14, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
            `Submission Date: ${format(
                new Date(submission.created_at),
                "PPP p"
            )}`,
            14,
            30
        );
        doc.text(`Status: ${submission.status.toUpperCase()}`, 14, 36);

        const tableColumn = ["Field", "Submitted Value"];
        const tableRows = form.fields.map((field) => {
            let value = submission.data[field.name];

            // Special handling for signature
            if (field.type === "signature") {
                if (Array.isArray(value)) {
                    // If multiple signatures, show count
                    value = `${value.length} Signature(s) Provided`;
                } else if (value && value.printed_name) {
                    value = `Signature (Printed Name: ${value.printed_name}, Date: ${value.date})`;
                } else {
                    value = "Signature Provided";
                }
            } else if (field.type === "file") {
                value = value ? "File Uploaded" : "No File";
            }

            return [field.label, value || "Not Provided"];
        });

        doc.autoTable({
            startY: 45,
            head: [tableColumn],
            body: tableRows,
            theme: "striped",
            styles: { fontSize: 9 },
        });

        doc.save(`${form.title}-submission-${submission.id}.pdf`);
    };

    return (
        <>
            {/* Image/File Preview Modal */}
            {previewFile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewFile(null)}
                >
                    <div className="max-w-4xl max-h-full">
                        <img
                            src={previewFile}
                            alt="File Preview"
                            className="max-w-full max-h-screen object-contain"
                        />
                    </div>
                </div>
            )}

            <AdminLayout
                header={
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Submission Details
                            </h2>
                        </div>
                        <div className="flex space-x-3">
                            <Link
                                href={route(
                                    "admin.forms.submissions.index",
                                    form.id
                                )}
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
                                    {currentStatus.icon}
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.className}`}
                                    >
                                        {currentStatus.label}
                                    </span>
                                </div>

                                {/* Submission Data */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Submission Data
                                        </h3>
                                        <div className="space-y-4">
                                            {form.fields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="w-full bg-gray-50 p-4 rounded-lg"
                                                >
                                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                                        {field.label}
                                                        {field.is_required && (
                                                            <span className="text-red-500 ml-1">
                                                                *
                                                            </span>
                                                        )}
                                                    </p>
                                                    <div className="text-gray-900 font-semibold">
                                                        {field.type === "file"
                                                            ? renderFileField(
                                                                  field
                                                              )
                                                            : field.type ===
                                                              "signature"
                                                            ? renderSignatureField(
                                                                  field
                                                              )
                                                            : submission.data[
                                                                  field.name
                                                              ] ?? "N/A"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submitter Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Submitter Information
                                        </h3>
                                        <div className="w-full bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Submission Date
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {format(
                                                        new Date(
                                                            submission.created_at
                                                        ),
                                                        "PPP p"
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    IP Address
                                                </p>
                                                <p className="font-medium text-gray-900">
                                                    {submission.submitter_ip}
                                                </p>
                                            </div>
                                            {submission.submitter_email && (
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Email
                                                    </p>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            submission.submitter_email
                                                        }
                                                    </p>
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
        </>
    );
}
