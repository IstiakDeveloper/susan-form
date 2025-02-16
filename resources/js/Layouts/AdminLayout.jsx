import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    HomeIcon,
    DocumentTextIcon,
    UserIcon,
    Squares2X2Icon,
    PlusCircleIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AdminLayout({ children, header }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { auth } = usePage().props;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const sidebarLinks = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: Squares2X2Icon,
            current: route().current("dashboard"),
        },
        {
            name: "Forms",
            href: route("admin.forms.index"),
            icon: DocumentTextIcon,
            current: route().current("admin.forms.*"),
            subItems: [
                {
                    name: "All Forms",
                    href: route("admin.forms.index"),
                    icon: ClipboardDocumentListIcon,
                    current: route().current("admin.forms.index"),
                },
                {
                    name: "Create Form",
                    href: route("admin.forms.create"),
                    icon: PlusCircleIcon,
                    current: route().current("admin.forms.create"),
                },
            ],
        },
        {
            name: "Profile",
            href: route("profile.edit"),
            icon: UserIcon,
            current: route().current("profile.edit"),
        },
    ];

    const NavLink = ({ item, className = "" }) => {
        const isActive = item.current;

        return (
            <Link
                href={item.href}
                className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-md
                    transition-all duration-200 ease-in-out
                    ${
                        isActive
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                    ${className}
                `}
            >
                <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                            ? "text-indigo-600"
                            : "text-gray-400 group-hover:text-gray-500"
                    }`}
                />
                {item.name}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
                <button
                    onClick={toggleSidebar}
                    className="fixed z-50 top-4 left-4 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {isSidebarOpen ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    md:translate-x-0 ${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 bg-indigo-600 text-white">
                        <h1 className="text-xl font-bold tracking-wider">
                            SUSAN FORM
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
                        {sidebarLinks.map((item) => (
                            <div key={item.name} className="space-y-1">
                                <NavLink item={item} />

                                {item.subItems && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.subItems.map((subItem) => (
                                            <NavLink
                                                key={subItem.name}
                                                item={subItem}
                                                className="pl-10 text-sm"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src={
                                    auth.user.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        auth.user.name
                                    )}&background=random`
                                }
                                alt="User Avatar"
                                className="h-9 w-9 rounded-full ring-2 ring-gray-200"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {auth.user.email}
                                </p>
                            </div>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="p-1 text-gray-400 hover:text-gray-500"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="md:pl-64 flex flex-col min-h-screen">
                {/* Header */}
                {header && (
                    <header className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {header}
                            </h1>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="flex-1 py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-500">
                            © {new Date().getFullYear()} Admin Dashboard. All
                            rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
