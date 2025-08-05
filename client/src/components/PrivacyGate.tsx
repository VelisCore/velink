import React, { useState, useEffect } from 'react';
import MaintenanceMode from './MaintenanceMode';

interface PrivacyGateProps {
    children: React.ReactNode;
}

interface PrivacyStatus {
    isPrivate: boolean;
    isMaintenanceMode: boolean;
    maintenanceMessage?: string;
    estimatedCompletion?: string;
    hasAccess: boolean;
}

const PrivacyGate: React.FC<PrivacyGateProps> = ({ children }) => {
    const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>({
        isPrivate: false,
        isMaintenanceMode: false,
        hasAccess: true
    });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkPrivacyStatus();
    }, []);

    const checkPrivacyStatus = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Check if the site responds normally or requires password
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Include password if we have one stored
                    ...(sessionStorage.getItem('websitePassword') && {
                        'x-website-password': sessionStorage.getItem('websitePassword') || ''
                    })
                }
            });
            
            if (response.status === 401) {
                const data = await response.json();
                if (data.requiresPassword) {
                    setPrivacyStatus({
                        isPrivate: true,
                        isMaintenanceMode: false,
                        hasAccess: false
                    });
                }
            } else if (response.status === 503) {
                const data = await response.json();
                setPrivacyStatus({
                    isPrivate: false,
                    isMaintenanceMode: true,
                    maintenanceMessage: data.message,
                    estimatedCompletion: data.estimatedCompletion,
                    hasAccess: false
                });
            } else if (response.ok) {
                setPrivacyStatus({
                    isPrivate: false,
                    isMaintenanceMode: false,
                    hasAccess: true
                });
            } else {
                // Handle other error statuses
                throw new Error(`Server responded with status ${response.status}`);
            }
        } catch (error) {
            console.error('Error checking privacy status:', error);
            // On network error, assume the site is accessible but log the error
            setPrivacyStatus({
                isPrivate: false,
                isMaintenanceMode: false,
                hasAccess: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            
            if (data.valid) {
                // Store password in sessionStorage for future requests
                sessionStorage.setItem('websitePassword', password);
                setPrivacyStatus(prev => ({ ...prev, hasAccess: true }));
            } else {
                setError('Invalid password. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Check for stored password on component mount
    useEffect(() => {
        const storedPassword = sessionStorage.getItem('websitePassword');
        if (storedPassword && privacyStatus.isPrivate && !privacyStatus.hasAccess) {
            setPassword(storedPassword);
            // Verify stored password is still valid
            fetch('/api/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: storedPassword }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    setPrivacyStatus(prev => ({ ...prev, hasAccess: true }));
                } else {
                    sessionStorage.removeItem('websitePassword');
                }
            })
            .catch(console.error);
        }
    }, [privacyStatus.isPrivate, privacyStatus.hasAccess]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (privacyStatus.isMaintenanceMode) {
        return (
            <MaintenanceMode
                message={privacyStatus.maintenanceMessage}
                estimatedCompletion={privacyStatus.estimatedCompletion}
                onRetry={checkPrivacyStatus}
            />
        );
    }

    if (privacyStatus.isPrivate && !privacyStatus.hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Private Website</h1>
                        <p className="text-gray-600">
                            This website is private. Please enter the password to continue.
                        </p>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Checking...' : 'Access Website'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Add password header to all future requests if we have access
    if (privacyStatus.hasAccess && privacyStatus.isPrivate) {
        const storedPassword = sessionStorage.getItem('websitePassword');
        if (storedPassword) {
            // Override fetch to include password header
            const originalFetch = window.fetch;
            window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
                const headers = new Headers(init?.headers);
                headers.set('x-website-password', storedPassword);
                
                return originalFetch(input, {
                    ...init,
                    headers
                });
            };
        }
    }

    return <>{children}</>;
};

export default PrivacyGate;
