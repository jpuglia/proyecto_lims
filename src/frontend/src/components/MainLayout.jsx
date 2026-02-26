import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-bg-dark text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
