import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value: string; // Base64 string
  onChange: (base64: string) => void;
  required?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, required }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) { 
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
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-[#93C1F1] uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        className={`relative w-full overflow-hidden border-2 border-dashed rounded-xl transition-all
          ${value ? 'border-transparent bg-white/5 p-0' : 'border-white/10 hover:border-[#93C1F1]/50 hover:bg-white/10 p-8'}
          flex items-center justify-center min-h-[160px]`}
      >
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={handleFileChange} 
          accept="image/*"
          capture="environment"
          className="hidden" 
        />
        <input 
          type="file" 
          ref={galleryInputRef} 
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
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                className="bg-white/20 hover:bg-white text-white hover:text-[#93C1F1] p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Tirar nova foto"
              >
                <Camera size={20} />
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
                className="bg-white/20 hover:bg-white text-white hover:text-[#93C1F1] p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Escolher da galeria"
              >
                <ImageIcon size={20} />
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
          <div className="flex flex-col items-center justify-center text-[#93C1F1] gap-4 w-full h-full">
            <p className="font-medium text-white text-sm">Adicionar foto</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                className="flex items-center gap-2 bg-[#42729E] hover:bg-[#42729E]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
              >
                <Camera size={18} />
                Câmera
              </button>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
              >
                <ImageIcon size={18} />
                Galeria
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
