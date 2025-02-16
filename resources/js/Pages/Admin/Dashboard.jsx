import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ChartBarIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CircleStackIcon,
    SignalIcon,
    ChartPieIcon
} from '@heroicons/react/24/outline';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart
} from 'recharts';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard({
    metrics,
    recentForms,
    recentSubmissions,
    submissionsTrend,
    formActivity
}) {
    // State for active tab
    const [activeTab, setActiveTab] = useState('overview');

    // Color palette
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Prepare submissions trend data
    const trendData = submissionsTrend.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }),
        submissions: item.count
    }));

    // Prepare status distribution data
    const statusData = metrics.submissionsByStatus.map(status => ({
        name: status.status,
        value: status.count
    }));

    return (
        <AdminLayout>
        <div className="min-h-screen bg-gray-100">
            <Head title="Admin Dashboard" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>
                    <div className="flex space-x-4">
                        <Link
                            href={route('admin.forms.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            Create New Form
                        </Link>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                            
                            { id: 'submissions', label: 'Submissions', icon: CircleStackIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center pb-4 px-1 border-b-2
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Key Metrics Cards */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Total Forms
                            </h3>
                            <div className="text-3xl font-bold text-indigo-600">
                                {metrics.totalForms}
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Total Submissions
                            </h3>
                            <div className="text-3xl font-bold text-green-600">
                                {metrics.totalSubmissions}
                            </div>
                        </div>

                        {/* Submissions Status Pie Chart */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Submission Status
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Forms Tab */}
                {activeTab === 'forms' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Forms */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Recent Forms
                            </h3>
                            <div className="space-y-4">
                                {recentForms.map((form) => (
                                    <div
                                        key={form.id}
                                        className="flex justify-between items-center border-b pb-2 last:border-b-0"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {form.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {form.submissions_count} Submissions
                                            </p>
                                        </div>
                                        <Link
                                            href={route('admin.forms.edit', form.id)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Activity */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Form Activity
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={formActivity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="title" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="submission_count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Submissions Trend */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Submissions Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="submissions"
                                        stroke="#8884d8"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Submissions */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Recent Submissions
                            </h3>
                            <div className="space-y-4">
                                {recentSubmissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        className="flex justify-between items-center border-b pb-2 last:border-b-0"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {submission.form.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(submission.created_at).toLocaleString()}
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
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </AdminLayout>
    );
}
