import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-bg-dark text-white">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 min-h-screen overflow-x-hidden" style={{ marginLeft: '16rem' }}>
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
