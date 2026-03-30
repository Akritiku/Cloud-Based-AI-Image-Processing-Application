// import React, { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { User } from 'firebase/auth';
// import { motion, AnimatePresence } from 'motion/react';
// import { 
//   Upload, 
//   Image as ImageIcon, 
//   Sparkles, 
//   Check, 
//   ChevronRight, 
//   Loader2, 
//   Download, 
//   Save,
//   RefreshCw,
//   X
// } from 'lucide-react';
// import { generateRoomDesign } from '../services/huggingface';
// import { db, storage } from '../firebase';
// import { collection, addDoc } from 'firebase/firestore';
// import { ref, uploadString, getDownloadURL } from 'firebase/storage';
// import ComparisonSlider from '../components/ComparisonSlider';
// import confetti from 'canvas-confetti';

// const ROOM_TYPES = [
//   { id: 'living room', label: 'Living Room', icon: '🛋️' },
//   { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
//   { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
//   { id: 'office', label: 'Office', icon: '🖥️' },
//   { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
//   { id: 'dining room', label: 'Dining Room', icon: '🍽️' }
// ];

// const STYLES = [
//   { id: 'modern', label: 'Modern', desc: 'Sleek & Contemporary' },
//   { id: 'minimalist', label: 'Minimalist', desc: 'Clean & Simple' },
//   { id: 'luxury', label: 'Luxury', desc: 'Elegant & High-end' },
//   { id: 'scandinavian', label: 'Scandinavian', desc: 'Cozy & Functional' },
//   { id: 'industrial', label: 'Industrial', desc: 'Raw & Urban' },
//   { id: 'bohemian', label: 'Bohemian', desc: 'Eclectic & Artistic' },
//   { id: 'vintage', label: 'Vintage', desc: 'Classic & Nostalgic' }
// ];

// const COLORS = [
//   { id: 'light', label: 'Light', color: 'bg-slate-100' },
//   { id: 'dark', label: 'Dark', color: 'bg-slate-800' },
//   { id: 'pastel', label: 'Pastel', color: 'bg-pink-100' },
//   { id: 'warm', label: 'Warm', color: 'bg-orange-100' },
//   { id: 'cool', label: 'Cool', color: 'bg-blue-100' },
//   { id: 'monochrome', label: 'Monochrome', color: 'bg-slate-400' }
// ];

// export default function UploadPage({ user }: { user: User }) {
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [roomType, setRoomType] = useState(ROOM_TYPES[0].id);
//   const [style, setStyle] = useState(STYLES[0].id);
//   const [colorTheme, setColorTheme] = useState(COLORS[0].id);
  
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [result, setResult] = useState<{ original: string; generated: string; prompt: string } | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     const selectedFile = acceptedFiles[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result as string);
//       };
//       reader.readAsDataURL(selectedFile);
//       setResult(null);
//       setSaved(false);
//     }
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
//     multiple: false
//   } as any);

//   const handleGenerate = async () => {
//   if (!preview) return;
  
//   setIsGenerating(true);
//   setResult(null);
  
//   try {
//     // 1. Call your new Hugging Face service
//     // We pass a combined string of the user's choices
//     const generatedImageUrl = await generateRoomDesign(
//       `${style} style ${roomType} with a ${colorTheme} color theme`
//     );
    
//     // 2. Set the result
//     // Since we are no longer getting a 'prompt' back from the API, 
//     // we save the description we sent to the AI.
//     setResult({
//       original: preview,
//       generated: generatedImageUrl,
//       prompt: `${style} ${roomType}, ${colorTheme} theme`
//     });
    
//     // 3. Success effect
//     confetti({
//       particleCount: 100,
//       spread: 70,
//       origin: { y: 0.6 },
//       colors: ['#4f46e5', '#818cf8', '#c7d2fe']
//     });
//   } catch (error) {
//     console.error("Design Generation Error:", error);
//     alert("Failed to generate design. The AI model might be loading. Please try again in 30 seconds.");
//   } finally {
//     setIsGenerating(false);
//   }
// };

//   const uploadImage = async (base64: string, path: string) => {
//     const storageRef = ref(storage, path);
//     await uploadString(storageRef, base64, 'data_url');
//     return await getDownloadURL(storageRef);
//   };

//   const handleSave = async () => {
//     if (!result || !user) return;
    
//     setIsSaving(true);
//     try {
//       const timestamp = Date.now();
//       const originalPath = `designs/${user.uid}/${timestamp}_original.png`;
//       const generatedPath = `designs/${user.uid}/${timestamp}_generated.png`;

//       const [originalUrl, generatedUrl] = await Promise.all([
//         uploadImage(result.original, originalPath),
//         uploadImage(result.generated, generatedPath)
//       ]);

//       await addDoc(collection(db, 'designs'), {
//         userId: user.uid,
//         originalImageUrl: originalUrl,
//         generatedImageUrl: generatedUrl,
//         roomType,
//         style,
//         colorTheme,
//         prompt: result.prompt,
//         createdAt: new Date().toISOString()
//       });
//       setSaved(true);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save design. " + (error instanceof Error ? error.message : ""));
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDownload = () => {
//     if (!result) return;
//     const link = document.createElement('a');
//     link.href = result.generated;
//     link.download = `redesign-${roomType}-${style}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="grid lg:grid-cols-12 gap-12">
        
//         {/* Left Column: Controls */}
//         <div className="lg:col-span-4 space-y-8">
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
//             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
//               <Sparkles className="w-5 h-5 text-indigo-600" />
//               Design Preferences
//             </h2>

//             <div className="space-y-6">
//               {/* Room Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3">Room Type</label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {ROOM_TYPES.map((type) => (
//                     <button
//                       key={type.id}
//                       onClick={() => setRoomType(type.id)}
//                       className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
//                         roomType === type.id 
//                           ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
//                           : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
//                       }`}
//                     >
//                       <span>{type.icon}</span>
//                       {type.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Style */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3">Interior Style</label>
//                 <div className="space-y-2">
//                   {STYLES.map((s) => (
//                     <button
//                       key={s.id}
//                       onClick={() => setStyle(s.id)}
//                       className={`w-full flex flex-col items-start px-4 py-3 rounded-xl text-sm transition-all border ${
//                         style === s.id 
//                           ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
//                           : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
//                       }`}
//                     >
//                       <span className="font-bold">{s.label}</span>
//                       <span className={`text-xs ${style === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>{s.desc}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Color Theme */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3">Color Theme</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {COLORS.map((c) => (
//                     <button
//                       key={c.id}
//                       onClick={() => setColorTheme(c.id)}
//                       className={`flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${
//                         colorTheme === c.id 
//                           ? 'border-indigo-600 ring-2 ring-indigo-100' 
//                           : 'border-slate-200 hover:border-indigo-200'
//                       }`}
//                     >
//                       <div className={`w-full h-8 rounded-lg ${c.color} border border-slate-200`}></div>
//                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{c.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 onClick={handleGenerate}
//                 disabled={!preview || isGenerating}
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 mt-8"
//               >
//                 {isGenerating ? (
//                   <>
//                     <Loader2 className="w-6 h-6 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Sparkles className="w-6 h-6" />
//                     Redesign Room
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Right Column: Preview & Result */}
//         <div className="lg:col-span-8 space-y-8">
//           <AnimatePresence mode="wait">
//             {result ? (
//               <motion.div 
//                 key="result"
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="space-y-6"
//               >
//                 <ComparisonSlider 
//                   beforeImage={result.original} 
//                   afterImage={result.generated} 
//                 />
                
//                 <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//                   <div className="flex items-center gap-4">
//                     <button 
//                       onClick={handleDownload}
//                       className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all"
//                     >
//                       <Download className="w-5 h-5" /> Download
//                     </button>
//                     <button 
//                       onClick={handleSave}
//                       disabled={isSaving || saved}
//                       className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${
//                         saved 
//                           ? 'bg-green-50 border-green-200 text-green-600' 
//                           : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
//                       }`}
//                     >
//                       {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
//                       {saved ? 'Saved to Dashboard' : (isSaving ? 'Saving...' : 'Save Design')}
//                     </button>
//                   </div>
                  
//                   <button 
//                     onClick={() => setResult(null)}
//                     className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all"
//                   >
//                     <RefreshCw className="w-5 h-5" /> Try Another
//                   </button>
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.div 
//                 key="upload"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="space-y-6"
//               >
//                 {!preview ? (
//                   <div 
//                     {...getRootProps()} 
//                     className={`border-4 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[400px] ${
//                       isDragActive ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
//                     }`}
//                   >
//                     <input {...getInputProps()} />
//                     <div className="bg-indigo-100 p-6 rounded-full mb-6">
//                       <Upload className="w-12 h-12 text-indigo-600" />
//                     </div>
//                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload your room photo</h3>
//                     <p className="text-slate-500 text-center max-w-sm">
//                       Drag and drop your image here, or click to browse. Supports JPG, PNG.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="relative group">
//                     <img 
//                       src={preview} 
//                       alt="Preview" 
//                       className="w-full aspect-video object-cover rounded-3xl shadow-xl border-4 border-white" 
//                     />
//                     <button 
//                       onClick={() => { setFile(null); setPreview(null); }}
//                       className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-lg p-2 rounded-full text-slate-600 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
//                     >
//                       <X className="w-6 h-6" />
//                     </button>
//                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3">
//                       <ImageIcon className="w-5 h-5 text-indigo-600" />
//                       <span className="font-bold text-slate-800">Ready to redesign</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
//                   <div className="bg-amber-100 p-2 rounded-lg h-fit">
//                     <Sparkles className="w-5 h-5 text-amber-600" />
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-amber-900 mb-1">Pro Tip</h4>
//                     <p className="text-sm text-amber-800 leading-relaxed">
//                       For the best results, use a clear, well-lit photo of your room taken from a wide angle. Avoid blurry or very dark images.
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Image as ImageIcon, Sparkles, X, 
  Loader2, Download, Save, RefreshCw, Lightbulb, 
  Palette, Sofa, Layers, Sun, LayoutGrid 
} from 'lucide-react';
import { generateRoomDesign } from '../services/huggingface';
import ComparisonSlider from '../components/ComparisonSlider';
import confetti from 'canvas-confetti';

// --- CONFIGURATION DATA ---
const ROOM_TYPES = [
  { id: 'living room', label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'office', label: 'Office', icon: '🖥️' },
  { id: 'dining room', label: 'Dining Room', icon: '🍽️' }
];

const STYLES = [
  { id: 'modern', label: 'Modern', desc: 'Sleek & Contemporary' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean & Simple' },
  { id: 'luxury', label: 'Luxury', desc: 'Elegant & High-end' },
  { id: 'scandinavian', label: 'Scandinavian', desc: 'Cozy & Functional' },
  { id: 'industrial', label: 'Industrial', desc: 'Raw & Urban' }
];

const LIGHTING_MODES = [
  { id: 'natural', label: 'Natural Light', icon: <Sun size={14}/> },
  { id: 'warm', label: 'Warm & Cozy', icon: '🌙' },
  { id: 'studio', label: 'Studio Bright', icon: '💡' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' }
];

const FLOORING_TYPES = [
  { id: 'light oak', label: 'Light Oak Wood' },
  { id: 'dark walnut', label: 'Dark Walnut' },
  { id: 'white marble', label: 'White Marble' },
  { id: 'polished concrete', label: 'Polished Concrete' }
];

export default function UploadPage({ user }: { user: User }) {
  // Core State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Preference State
  const [roomType, setRoomType] = useState(ROOM_TYPES[0].id);
  const [style, setStyle] = useState(STYLES[0].id);
  const [lighting, setLighting] = useState(LIGHTING_MODES[0].id);
  const [flooring, setFlooring] = useState(FLOORING_TYPES[0].id);

  // Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ original: string; generated: string } | null>(null);
  const [variations, setVariations] = useState<{id: number, url: string, label: string}[]>([]);
  const [suggestions, setSuggestions] = useState({ colors: "", furniture: "", decor: "" });

  // Dropzone Setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      }
    }, []),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  const handleGenerate = async () => {
    if (!preview) return;
    setIsGenerating(true);
    setResult(null);
    
    try {
      // Prompt Engineering using all preferences
      const prompt = `High-end interior design of a ${roomType}, ${style} style, ${lighting} lighting, ${flooring} flooring, photorealistic, 8k resolution, architectural photography.`;
      
      const generatedImageUrl = await generateRoomDesign(prompt);
      
      setResult({ original: preview, generated: generatedImageUrl });

      // Dynamic AI suggestions based on preferences
      setSuggestions({
        colors: `Since you chose ${style}, use a neutral base with accents that complement the ${flooring} floors.`,
        furniture: `In this ${roomType}, prioritize low-profile furniture to maintain the ${lighting} atmosphere.`,
        decor: "Add metallic or organic textures to contrast with the chosen flooring material."
      });

      // Mock 10 variations (Populate with real API data in production)
      const mockGallery = STYLES.concat(STYLES).map((s, i) => ({
        id: i,
        url: generatedImageUrl, 
        label: `${s.label} Variant`
      }));
      setVariations(mockGallery);

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      alert("The AI model is busy. Please try again in 30 seconds.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: Design Preferences */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Design Studio
            </h2>

            <div className="space-y-5">
              {/* Room Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_TYPES.map((t) => (
                    <button key={t.id} onClick={() => setRoomType(t.id)} 
                      className={`p-2.5 rounded-xl text-xs border transition-all ${roomType === t.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-100'}`}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lighting Mood</label>
                <div className="grid grid-cols-2 gap-2">
                  {LIGHTING_MODES.map((l) => (
                    <button key={l.id} onClick={() => setLighting(l.id)} 
                      className={`p-2.5 rounded-xl text-xs border transition-all flex items-center justify-center gap-2 ${lighting === l.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-100'}`}>
                      {l.icon} {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flooring Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flooring Material</label>
                <select value={flooring} onChange={(e) => setFlooring(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {FLOORING_TYPES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interior Style</label>
                <div className="space-y-2">
                  {STYLES.map((s) => (
                    <button key={s.id} onClick={() => setStyle(s.id)} 
                      className={`w-full text-left p-3 rounded-xl border transition-all ${style === s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}>
                      <p className="font-bold text-xs">{s.label}</p>
                      <p className={`text-[10px] ${style === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!preview || isGenerating} 
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-3 mt-4">
                {isGenerating ? <><Loader2 className="animate-spin" /> Rendering...</> : <><Sparkles size={18}/> Generate Design</>}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN DISPLAY: Result & Analysis */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Comparison UI */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                  <ComparisonSlider beforeImage={result.original} afterImage={result.generated} />
                </div>

                {/* AI Text Suggestions */}
                <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Lightbulb className="text-amber-500" size={20} /> Professional Recommendations
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                      <Palette className="text-indigo-600 mb-2" size={18}/>
                      <h4 className="font-bold text-xs text-slate-800 mb-1">Color Strategy</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{suggestions.colors}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                      <Sofa className="text-indigo-600 mb-2" size={18}/>
                      <h4 className="font-bold text-xs text-slate-800 mb-1">Furniture Fit</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{suggestions.furniture}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                      <Layers className="text-indigo-600 mb-2" size={18}/>
                      <h4 className="font-bold text-xs text-slate-800 mb-1">Accents</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{suggestions.decor}</p>
                    </div>
                  </div>
                </div>

                {/* Variations Gallery (10 Templates) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                      <LayoutGrid size={18} className="text-indigo-600" /> Explore More Templates
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {variations.map((v) => (
                      <div key={v.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all">
                        <img src={v.url} alt={v.label} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                          <span className="text-[9px] text-white font-bold">{v.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button onClick={() => setResult(null)} className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
                    <RefreshCw size={16}/> Redesign Another Photo
                  </button>
                </div>

              </motion.div>
            ) : (
              /* Upload State */
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                {...getRootProps()} className={`border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center bg-white transition-all ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <input {...getInputProps()} />
                {preview ? (
                  <div className="relative w-full max-w-2xl">
                    <img src={preview} className="w-full rounded-2xl shadow-xl border border-slate-200" />
                    <button onClick={(e) => { e.stopPropagation(); setPreview(null); }} className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><X size={18}/></button>
                  </div>
                ) : (
                  <>
                    <div className="bg-indigo-50 p-5 rounded-full mb-4 text-indigo-600"><Upload size={40} /></div>
                    <h3 className="text-xl font-bold mb-1 text-slate-800">Upload Room Photo</h3>
                    <p className="text-slate-400 text-sm">Drag your empty room here or click to browse</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}