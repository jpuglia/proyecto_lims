import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Inbox, 
    Microscope, 
    Thermometer, 
    FileText, 
    ClipboardList,
    Layers
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import RoleGuard from '../components/RoleGuard';

// Tabs
import ReceptionTab from '../components/Analysis/ReceptionTab';
import ExecutionTab from '../components/Analysis/ExecutionTab';
import IncubationTab from '../components/Analysis/IncubationTab';
import ReadingTab from '../components/Analysis/ReadingTab';
import ReportTab from '../components/Analysis/ReportTab';

const tabs = [
    { id: 'recepcion', label: 'Recepciones', icon: Inbox },
    { id: 'analisis', label: 'Análisis', icon: Microscope },
    { id: 'incubacion', label: 'Incubaciones', icon: Thermometer },
    { id: 'lectura', label: 'Lectura', icon: FileText },
    { id: 'reporte', label: 'Reporte', icon: ClipboardList },
];

const AnalysisPage = () => {
    const [activeTab, setActiveTab] = useState('recepcion');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recepcion': return <ReceptionTab />;
            case 'analisis': return <ExecutionTab />;
            case 'incubacion': return <IncubationTab />;
            case 'lectura': return <ReadingTab />;
            case 'reporte': return <ReportTab />;
            default: return <ReceptionTab />;
        }
    };

    return (
        <AnimatedPage className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-grad-primary rounded-xl text-white shadow-lg shadow-accent-primary/20">
                            <Layers size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main tracking-tight">Gestión Analítica</h1>
                    </div>
                    <p className="text-text-muted font-medium italic">Control total del ciclo de vida de la muestra y cumplimiento GAMP 5.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300
                                ${isActive ? 'text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-grad-primary rounded-xl shadow-lg shadow-accent-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon size={16} />
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <RoleGuard roles={['administrador', 'supervisor', 'analista']}>
                        {renderTabContent()}
                    </RoleGuard>
                </motion.div>
            </AnimatePresence>
        </AnimatedPage>
    );
};

export default AnalysisPage;
