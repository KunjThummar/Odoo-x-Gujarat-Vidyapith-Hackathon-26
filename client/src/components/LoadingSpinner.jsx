import React from 'react';

export default function LoadingSpinner({ size = 'h-8 w-8', color = 'border-brand-600', text = '' }) {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
            {text && <p className="mt-3 text-sm text-slate-500 font-medium animate-pulse">{text}</p>}
        </div>
    );
}
