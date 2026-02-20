import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

describe('Dashboard', () => {
    it('renders dashboard header', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('SAMA')).toBeInTheDocument();
    });

    it('displays greeting message', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText(/Good morning/i)).toBeInTheDocument();
    });
});
