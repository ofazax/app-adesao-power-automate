import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  options: string[];
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ 
  label, 
  error, 
  className = '', 
  options, 
  value, 
  onChange, 
  ...props 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof value === 'string' && value.length > 0) {
      const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const search = removeAccents(value.toLowerCase());

      const levenshtein = (a: string, b: string): number => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1, // deletion
              matrix[i - 1][j - 1] + indicator // substitution
            );
          }
        }
        return matrix[a.length][b.length];
      };

      const isFuzzyMatch = (searchStr: string, optionStr: string) => {
        if (optionStr.includes(searchStr)) return true;
        
        // Tolerância 1: Letras omitidas (ex: Bacelona -> Barcelona)
        const subSeqRegex = new RegExp(searchStr.split('').join('.*'), 'i');
        if (subSeqRegex.test(optionStr)) return true;

        // Tolerância 2: Letras erradas (ex: Barcelina -> Barcelona)
        if (searchStr.length >= 4) {
          const words = optionStr.split(' ');
          for (const word of words) {
            if (Math.abs(word.length - searchStr.length) <= 2) {
              if (levenshtein(searchStr, word.substring(0, searchStr.length)) <= 2) {
                return true;
              }
            }
          }
        }
        return false;
      };

      // Filtra as opções usando a busca tolerante a erros
      const filtered = options.filter(opt => {
        return isFuzzyMatch(search, removeAccents(opt.toLowerCase()));
      });

      // Ordena para que resultados que COMECEM com a busca apareçam primeiro
      filtered.sort((a, b) => {
        const normA = removeAccents(a.toLowerCase());
        const normB = removeAccents(b.toLowerCase());
        
        const aStarts = normA.startsWith(search);
        const bStarts = normB.startsWith(search);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return normA.localeCompare(normB); // Desempate alfabético normal
      });
      
      // Removemos a exibição do dropdown se o valor for idêntico ao que já foi digitado 
      if (filtered.length === 1 && removeAccents(filtered[0].toLowerCase()) === search) {
        setFilteredOptions([]);
      } else {
        setFilteredOptions(filtered.slice(0, 10)); // top 10 resultados para performance
      }
    } else {
      setFilteredOptions([]);
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (option: string) => {
    if (onChange) {
      // Mock event to match expected signature
      const event = {
        target: { value: option }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className={`flex flex-col gap-2 relative ${className}`}>
      <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`bg-white/5 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#93C1F1]/50 transition-all text-white placeholder:text-[#93C1F1]/40
          ${error ? 'border-red-500/50 focus:ring-red-500/50 bg-red-500/10' : 'border-white/10'}
          disabled:bg-white/5 disabled:text-[#93C1F1]/60 read-only:bg-black/30 read-only:text-[#93C1F1]/60 read-only:border-transparent read-only:focus:ring-0`}
        value={value}
        onChange={(e) => {
            setShowDropdown(true);
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const prevLength = e.target.value.length;

            if (onChange) {
              onChange(e);
              requestAnimationFrame(() => {
                if (e.target) {
                  const newLength = e.target.value.length;
                  let newStart = start;
                  let newEnd = end;

                  if (start === prevLength) {
                    newStart = newLength;
                    newEnd = newLength;
                  } else if (start !== null && end !== null) {
                    const diff = newLength - prevLength;
                    newStart = Math.max(0, start + diff);
                    newEnd = Math.max(0, end + diff);
                  }
                  
                  e.target.setSelectionRange(newStart, newEnd);
                }
              });
            }
        }}
        onFocus={() => setShowDropdown(true)}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}

      {showDropdown && filteredOptions.length > 0 && (
        <ul className="absolute top-[75px] left-0 right-0 z-[100] max-h-48 overflow-y-auto bg-[#1A365D] border border-white/20 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden divide-y divide-white/10">
          {filteredOptions.map((opt, i) => (
            <li 
              key={i}
              onClick={() => handleSelect(opt)}
              className="px-4 py-3 text-sm text-white/90 hover:bg-white/20 hover:text-white cursor-pointer transition-colors"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
