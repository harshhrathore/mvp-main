import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TestLanding - A development page to quickly navigate to any page
 * Access at /test or set as default route during development
 */
const TestLanding: React.FC = () => {
    const navigate = useNavigate();

    const pages = [
        { name: 'Landing Page', path: '/landing' },
        { name: 'Register', path: '/register' },
        { name: 'Login', path: '/login' },
        { name: 'Email Verification', path: '/verify-email' },
        { name: 'Medical Quiz Intro', path: '/medicalquiz-intro' },
        { name: 'Medical Quiz', path: '/medicalquiz' },
        { name: 'Onboarding Goals', path: '/onboarding-goals' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Profile', path: '/profile' },
        { name: 'Breathing', path: '/breathing' },
        { name: 'Today\'s Wellness', path: '/todays-wellness' },
        { name: 'AI Wellness Guide', path: '/ai-wellness-guide' },
        { name: 'Yoga', path: '/yoga' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' },
        { name: 'Ayurveda', path: '/ayurveda' },
        { name: 'Quiz Intro', path: '/quiz-intro' },
        { name: 'Quiz', path: '/quiz' },
        { name: 'Result', path: '/result' },
    ];

    const authActions = [
        {
            name: 'Mock Login (as test user)',
            action: () => {
                // Mock authentication for testing
                localStorage.setItem('token', 'test-token-12345');
                localStorage.setItem('user', JSON.stringify({
                    id: 'test-user-123',
                    email: 'test@example.com',
                    full_name: 'Test User',
                    created_at: new Date().toISOString()
                }));
                window.location.href = '/dashboard';
            }
        },
        {
            name: 'Mock Login + Complete Onboarding',
            action: () => {
                // Mock authentication for testing
                const userId = 'test-user-123';
                localStorage.setItem('token', 'test-token-12345');
                localStorage.setItem('user', JSON.stringify({
                    id: userId,
                    email: 'test@example.com',
                    full_name: 'Test User',
                    created_at: new Date().toISOString()
                }));
                localStorage.setItem(`onboarding_completed_${userId}`, 'true');
                window.location.href = '/dashboard';
            }
        },
        {
            name: 'Clear All Auth Data',
            action: () => {
                localStorage.clear();
                window.location.href = '/landing';
            }
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🧪 SAMA Dev Testing</h1>
                    <p className="text-gray-600 mb-4">Quick access to all pages for testing</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This page is for development only. Some pages require authentication.
                            Use the mock login buttons below to test protected pages.
                        </p>
                    </div>
                </div>

                {/* Auth Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Authentication Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {authActions.map((action) => (
                            <button
                                key={action.name}
                                onClick={action.action}
                                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                            >
                                {action.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Page Navigation */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 All Pages</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <button
                                key={page.path}
                                onClick={() => navigate(page.path)}
                                className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-left"
                            >
                                <div className="font-bold">{page.name}</div>
                                <div className="text-sm opacity-90 mt-1">{page.path}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Auth Status */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Current Status</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div>
                            <span className="font-bold">Token:</span> {localStorage.getItem('token') ? '✅ Present' : '❌ Not set'}
                        </div>
                        <div>
                            <span className="font-bold">User:</span> {localStorage.getItem('user') ? '✅ Set' : '❌ Not set'}
                        </div>
                        <div>
                            <span className="font-bold">Onboarding:</span> {
                                localStorage.getItem('token') && localStorage.getItem('user')
                                    ? (localStorage.getItem(`onboarding_completed_${JSON.parse(localStorage.getItem('user') || '{}').id}`) ? '✅ Completed' : '❌ Not completed')
                                    : 'N/A (not logged in)'
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestLanding;
