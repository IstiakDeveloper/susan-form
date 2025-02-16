import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // If no links provided, don't render anything
    if (!links || !links.links) {
        return null;
    }

    // Check if there's only one page
    if (links.links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {links.prev && (
                    <Link
                        href={links.prev}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                )}
                {links.next && (
                    <Link
                        href={links.next}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    {links.total > 0 && (
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{links.from}</span> to{' '}
                            <span className="font-medium">{links.to}</span> of{' '}
                            <span className="font-medium">{links.total}</span> results
                        </p>
                    )}
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {links.links.map((link, index) => {
                            // Don't render "..." links
                            if (link.label.includes('...')) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            // If it's a disabled link
                            if (link.url === null) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            // Active or inactive link
                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        link.active
                                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
