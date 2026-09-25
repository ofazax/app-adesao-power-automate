import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string; // Base64 string
  onChange: (base64: string) => void;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, required }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) { // Increased to 15MB to allow modern phone photos before compression
      setError('A imagem deve ter no máximo 15MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1200;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height *= MAX_SIZE / width));
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width *= MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG 70% quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            onChange(compressedBase64);
          } else {
            onChange(reader.result as string);
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        onClick={() => !value && fileInputRef.current?.click()}
        className={`relative w-full overflow-hidden border-2 border-dashed rounded-xl transition-all
          ${value ? 'border-transparent bg-white/5 p-0' : 'border-white/10 hover:border-[#93C1F1]/50 hover:bg-white/10 cursor-pointer p-8'}
          flex items-center justify-center min-h-[160px]`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*"
          className="hidden" 
        />
        
        {value ? (
          <div className="relative w-full h-full group aspect-video">
            <img src={value} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/20 hover:bg-white text-white hover:text-[#93C1F1] p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Trocar imagem"
              >
                <Camera size={20} />
              </button>
              <button 
                type="button"
                onClick={handleRemove}
                className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Remover imagem"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#93C1F1] gap-3 text-center">
            <div className="bg-[#42729E]/50 p-3 rounded-full text-[#93C1F1] border border-[#42729E]/50 shadow-lg shadow-black/20">
              <Camera size={28} />
            </div>
            <div>
              <p className="font-medium text-white">Toque para adicionar foto</p>
              <p className="text-xs mt-1 max-w-[200px] mx-auto text-[#93C1F1]/60">JPG ou PNG (máx. 5MB)</p>
            </div>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
