import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`bg-white/5 border rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 transition-all appearance-none cursor-pointer text-white truncate
          ${error ? 'border-red-500/50 focus:ring-red-500/50 bg-red-500/10' : 'border-white/10'}
          disabled:bg-white/5 disabled:text-[#93C1F1]/60`}
        {...props}
      >
        <option value="" disabled className="bg-[#162A3D]">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#162A3D]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
