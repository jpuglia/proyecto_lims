import React, { useState } from 'react';
import { ShieldCheck, X, Lock, User, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../context/AuthContext';

const ElectronicSignatureModal = ({ isOpen, onClose, onSign, actionName }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, we'd verify the password with the backend
      // await authService.verifyPassword(password);
      
      // Simulate verification
      setTimeout(() => {
        if (password === 'admin' || password.length > 3) {
          onSign({
            signedBy: user?.username,
            timestamp: new Date().toISOString(),
            action: actionName
          });
          onClose();
        } else {
          setError('Contraseña incorrecta para firma electrónica.');
          setIsSubmitting(false);
        }
      }, 1000);
    } catch {
      setError('Error al verificar identidad.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in zoom-in-95 duration-300">
        <CardHeader className="border-b border-border-light pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={24} />
              <CardTitle className="text-xl font-black">Firma Electrónica</CardTitle>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
              <X size={20} />
            </button>
          </div>
          <CardDescription className="mt-2 font-medium">
            Usted está por autorizar la siguiente acción: 
            <span className="block mt-1 p-2 bg-bg-surface rounded-lg text-text-main font-black uppercase text-[10px] border border-border-light italic">
              "{actionName}"
            </span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-8 space-y-6">
            <div className="p-4 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3">
              <AlertTriangle className="text-warning shrink-0" size={18} />
              <p className="text-[10px] leading-relaxed text-warning-800 font-bold uppercase tracking-wider">
                De acuerdo con GAMP 5 y 21 CFR Part 11, esta firma es el equivalente legal de su firma manuscrita. 
                Al firmar, usted asume la responsabilidad total por la veracidad de los datos.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Usuario</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface rounded-xl border border-border-light">
                  <User size={16} className="text-text-muted" />
                  <span className="text-sm font-black text-text-main">{user?.username}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <Input 
                    type="password"
                    autoFocus
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de acceso"
                    className="pl-11"
                  />
                </div>
                {error && <p className="text-[10px] text-error font-bold mt-1 ml-1">{error}</p>}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-bg-surface p-6 border-t border-border-light flex-col gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl">
              {isSubmitting ? 'Verificando Identidad...' : 'Firmar y Autorizar'}
            </Button>
            <p className="text-[10px] text-text-muted text-center font-bold italic">
              Su dirección IP y marca de tiempo serán registradas en el Audit Trail.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ElectronicSignatureModal;
