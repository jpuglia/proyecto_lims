import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import InspectorSamplingForm from '../components/Inspector/InspectorSamplingForm';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const AdhocInspectionPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/sampling');
  };

  return (
    <AnimatedPage className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-4xl font-black text-text-main tracking-tight">Inspección Ad-hoc</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-premium border border-white">
        <InspectorSamplingForm 
          onSuccess={handleSuccess}
          onCancel={() => navigate(-1)}
        />
      </div>
    </AnimatedPage>
  );
};

export default AdhocInspectionPage;
