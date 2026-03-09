import React from 'react';

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <h1 className="text-4xl font-black text-text-main">{title}</h1>
    <p className="text-text-muted">Esta sección está en desarrollo siguiendo el nuevo diseño.</p>
  </div>
);

export const DataEntryPage = () => <Placeholder title="Data Entry" />;
export const ReviewQueuePage = () => <Placeholder title="Review Queue" />;
export const SettingsPage = () => <Placeholder title="Settings" />;
export const SampleDetailPage = () => <Placeholder title="Sample Detail" />;
