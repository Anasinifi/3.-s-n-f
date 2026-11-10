import React, { useRef, useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { measureGain, withGain } from '../../utils/audioLevel';
import { Loader2, CheckCircle, PlusCircle } from 'lucide-react';

// ============================================================================
// --- GRUP: MEDYA YÜKLEYİCİ (MEDIA UPLOADER) ---
// ============================================================================
export function MediaUploader({ label, value, onChange, id, type = "image", small = false }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getFileNameFromUrl = (url) => {
    if (!url || !url.includes('http')) return "dosya hazır";
    try {
        const decodedUrl = decodeURIComponent(url);
        const pathWithoutQuery = decodedUrl.split('?')[0];
        const parts = pathWithoutQuery.split('/');
        let fileName = parts[parts.length - 1];
        fileName = fileName.replace(/^\d{13}_/, '');
        return fileName;
    } catch (e) {
        return "dosya hazır";
    }
  };

  const uploadFileObject = async (file) => {
      if (!file || uploading) return;
      setUploading(true);
      try {
          const defaultExt = type === 'audio' ? 'mp3' : type === 'video' ? 'mp4' : 'png';
          const safeName = file.name ? file.name : `pano_dosyasi.${defaultExt}`;
          const uniqueName = `${Date.now()}_${safeName}`;
          const storageRef = ref(storage, `uploads/${type}s/${uniqueName}`);
          // ses: düzeyi ölç, yüksekse adrese kısma oranı yaz (çocuk uygulaması o düzeyde çalar)
          const gain = type === 'audio' ? await measureGain(file) : 1;
          await uploadBytes(storageRef, file, { cacheControl: 'public,max-age=31536000' }); // telefonda 1 yıl önbellekte kalsın (kota harcamasın)
          const url = await getDownloadURL(storageRef);
          onChange(type === 'audio' ? withGain(url, gain) : url);
      } catch (error) {
          console.error("yükleme hatası:", error);
          alert("dosya yüklenirken bir hata oluştu.");
      } finally {
          setUploading(false);
      }
  };

  const handleFile = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await uploadFileObject(file);
      if (fileRef.current) fileRef.current.value = "";
  };

  const extractFileFromClipboard = (clipboardData) => {
      if (!clipboardData) return null;
      if (clipboardData.files && clipboardData.files.length > 0) {
          return clipboardData.files[0];
      }
      if (clipboardData.items) {
          for (let i = 0; i < clipboardData.items.length; i++) {
              const item = clipboardData.items[i];
              if (item.kind === 'file') {
                  const f = item.getAsFile();
                  if (f) return f;
              }
          }
      }
      return null;
  };

  useEffect(() => {
      if (!isHovered) return;
      const handleGlobalPaste = (e) => {
          const activeTag = document.activeElement?.tagName;
          if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
          const file = extractFileFromClipboard(e.clipboardData);
          if (file) {
              e.preventDefault();
              e.stopPropagation();
              uploadFileObject(file);
          }
      };
      window.addEventListener('paste', handleGlobalPaste);
      return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isHovered, uploading, type, onChange]);

  const handlePaste = (e) => {
      const file = extractFileFromClipboard(e.clipboardData);
      if (file) {
          e.preventDefault();
          e.stopPropagation();
          uploadFileObject(file);
      }
  };

  const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  };

  const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (uploading) return;
      const file = e.dataTransfer?.files?.[0];
      if (file) {
          uploadFileObject(file);
      }
  };

  return (
    <div className="space-y-1 w-full text-left">
      <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">{label}</label>
          {value && <button type="button" onClick={() => onChange("")} className="text-red-400 text-[10px] font-bold underline">sil</button>}
      </div>
      <div
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPaste={handlePaste}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current.click()}
        title="tıkla, dosyayı sürükle-bırak veya üzerine gelip Ctrl+V ile yapıştır"
        className={`relative border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all outline-none focus:border-indigo-500 overflow-hidden ${isDragOver ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 scale-[1.01]' : 'bg-white hover:bg-slate-50 border-slate-200'} ${small ? 'h-14' : 'h-24'} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input type="file" hidden ref={fileRef} accept={type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*'} onChange={handleFile} disabled={uploading} />

        {uploading ? (
            <div className="flex flex-col items-center text-indigo-500">
              <Loader2 size={24} className="animate-spin mb-1"/>
              <span className="text-[9px] font-bold">yükleniyor...</span>
          </div>
        ) : (
            value ? (
                type === 'image' ? <img src={value} className="h-full object-contain p-1 rounded-none"/> :
               <div className="flex flex-col items-center justify-center w-full px-2 text-center">
                   <div className="flex items-center gap-1 text-green-600 font-bold text-[10px]"><CheckCircle size={14}/> yüklendi</div>
                   <span className="text-[8px] text-slate-500 font-medium break-all w-full leading-tight mt-0.5" title={getFileNameFromUrl(value)}>
                       {getFileNameFromUrl(value)}
                   </span>
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 gap-0.5 px-1 text-center">
                <PlusCircle size={16}/>
                {!small && <span className="text-[8px] font-bold text-slate-300">sürükle / ctrl+v</span>}
              </div>
            )
        )}
      </div>
    </div>
  );
}
