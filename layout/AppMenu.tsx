import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { useRouter } from 'next/navigation'; // Updated import

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isClient, setIsClient] = useState(false); // State to check if running in the client

    // Use the correct useRouter hook for the App Router
    const router = useRouter();

    // Check if window object is available (i.e., we're in the client-side)
    useEffect(() => {
        setIsClient(true); // Set to true once the component is mounted on the client-side
    }, []);

    // Check for token on component mount
    useEffect(() => {
        if (isClient) {
            const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
            if (token) {
                setIsAuthenticated(true); // User is authenticated
            } else {
                setIsAuthenticated(false); // User is not authenticated
            }
        }
    }, [isClient]);

    const model: AppMenuItem[] = [
        {
            label: 'Acceuil',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Gestion des utilisateurs',
            items: [
                {
                    label: 'Utilistateurs',
                    icon: 'pi pi-fw pi-users',
                    to: '/pages/user',
                }
            ]
        },
        {
            label: 'Gestion des Catégories',
            items: [{ label: 'Catégories', icon: 'pi pi-fw pi-paperclip', to: '/pages/category' }]
        },
        {
            label: 'Gestion des produits',
            items: [{ label: 'Produits', icon: 'pi pi-fw pi-truck', to: '/pages/product' }]
        },
        {
            label: 'Pages',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Landing',
                    icon: 'pi pi-fw pi-globe',
                    to: '/landing'
                },
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Crud',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/pages/crud'
                },
                {
                    label: 'Timeline',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pages/timeline'
                },
                {
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/pages/notfound'
                },
                {
                    label: 'Empty',
                    icon: 'pi pi-fw pi-circle-off',
                    to: '/pages/empty'
                }
            ]
        },
    ];

    // Redirect protected routes if not authenticated
    useEffect(() => {
        if (isAuthenticated === false && isClient) {
            // Redirect to login page if trying to access protected routes
            router.push('/auth/login');
        }
    }, [isAuthenticated, isClient, router]);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    // If the route is protected and user is not authenticated, don't render the menu item
                    if (item.items) {
                        item.items = item.items.filter((subItem) => {
                            if (!isAuthenticated) {
                                return false; // Hide protected route if not authenticated
                            }
                            return true;
                        });
                    }

                    return !item?.seperator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator" key={`separator-${i}`}></li>
                    );
                })}

                <Link href="https://blocks.primereact.org" target="_blank" style={{ cursor: 'pointer' }}>
                    <img alt="Prime Blocks" className="w-full mt-3" src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`} />
                </Link>
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
