import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    info: <Info className="w-4 h-4 text-violet-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-3 duration-200 max-w-md">
      <div className="p-1 rounded-full bg-slate-800 flex-shrink-0">
        {icons[toast.type || 'success']}
      </div>
      <div className="flex-1 text-xs">
        {toast.title && <p className="font-bold text-white">{toast.title}</p>}
        <p className="text-slate-300 text-[11.5px] mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
