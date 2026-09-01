import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`bg-white/5 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 transition-all text-white placeholder:text-[#93C1F1]/40
          ${error ? 'border-red-500/50 focus:ring-red-500/50 bg-red-500/10' : 'border-white/10'}
          disabled:bg-white/5 disabled:text-[#93C1F1]/60 read-only:bg-black/30 read-only:text-[#93C1F1]/60 read-only:border-transparent read-only:focus:ring-0`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
