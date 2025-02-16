import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    DocumentTextIcon,
    UserIcon,
    CogIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
    children,
    header
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { auth } = usePage().props;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const sidebarLinks = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: HomeIcon
        },
        {
            name: 'Forms',
            href: route('admin.forms.index'),
            icon: DocumentTextIcon
        },
        {
            name: 'Users',
            href: route('admin.forms.index'),
            icon: UserIcon
        },
        {
            name: 'Settings',
            href: route('admin.forms.index'),
            icon: CogIcon
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="fixed z-50 top-4 left-4 p-2 bg-indigo-600 text-white rounded-md"
                >
                    {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
                md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-center h-16 bg-indigo-600 text-white">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>

                <nav className="mt-5 px-4">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`
                                flex items-center px-4 py-2 mt-2 text-gray-600
                                hover:bg-indigo-100 hover:text-indigo-600
                                rounded-md transition-colors duration-200
                                ${route().current(link.name.toLowerCase())
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : ''}
                            `}
                        >
                            <link.icon className="h-5 w-5 mr-3" />
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <div className="flex items-center">
                        <img
                            src={auth.user.avatar || '/default-avatar.png'}
                            alt="User Avatar"
                            className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                            <p className="text-sm font-semibold">{auth.user.name}</p>
                            <p className="text-xs text-gray-500">{auth.user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="md:pl-64 min-h-screen flex flex-col">
                {/* Top Header */}
                {header && (
                    <header className="bg-white shadow-md">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-grow p-4 md:p-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Admin Dashboard
                </footer>
            </div>
        </div>
    );
}
