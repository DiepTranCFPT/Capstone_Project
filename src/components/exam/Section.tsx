import React from 'react'
import { useLocation } from 'react-router-dom'

const Section: React.FC = () => {
    const location = useLocation();

    // Function to generate breadcrumbs based on current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(segment => segment);

        const breadcrumbs = [{ label: 'Home', path: '/' }];
        let currentPath = '';

        for (let i = 0; i < pathSegments.length; i++) {
            currentPath += '/' + pathSegments[i];

            if (pathSegments[i] === 'exam-test') {
                breadcrumbs.push({ label: 'Exam Test', path: currentPath });
            } else if (pathSegments[i-1] === 'exam-test' && i > 0) {
                // This is an exam ID
                breadcrumbs.push({ label: 'Exam Detail', path: currentPath });
            } else if (pathSegments[i] === 'materials') {
                breadcrumbs.push({ label: 'Materials', path: currentPath });
            } else if (pathSegments[i-1] === 'materials' && i > 0) {
                breadcrumbs.push({ label: 'Material Detail', path: currentPath });
            } else if (pathSegments[i] === 'community') {
                breadcrumbs.push({ label: 'Community', path: currentPath });
            } else if (pathSegments[i] === 'ranking') {
                breadcrumbs.push({ label: 'Ranking', path: currentPath });
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Get the page title based on current path
    const getPageTitle = () => {
        if (location.pathname.includes('/exam-test/')) {
            return 'Exam Detail';
        }
        if (location.pathname === '/exam-test') {
            return 'Exam Test';
        }
        if (location.pathname.includes('/materials/')) {
            return 'Material Detail';
        }
        if (location.pathname === '/materials') {
            return 'Materials';
        }
        if (location.pathname === '/community') {
            return 'Community';
        }
        if (location.pathname === '/ranking') {
            return 'Ranking';
        }
        return 'Page';
    };

    return (
        <section className="bg-white py-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 opacity-10 rounded-full -translate-y-1/4 translate-x-1/4"></div>
            <div className="absolute top-8 right-8 w-32 h-32 border-4 border-teal-200 rounded-full"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800">{getPageTitle()}</h1>
                <p className="text-gray-500 mt-2">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.path}>
                            {index > 0 && ' / '}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-teal-500 font-semibold">{crumb.label}</span>
                            ) : (
                                crumb.label
                            )}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    )
}
export default Section
