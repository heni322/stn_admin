'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

interface RootLayoutProps {
    children: React.ReactNode;
}

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet" />
            </head>
            <body>
                <QueryClientProvider client={queryClient}> {/* Wrap everything inside QueryClientProvider */}
                    <PrimeReactProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </PrimeReactProvider>
                </QueryClientProvider>
            </body>
        </html>
    );
}
