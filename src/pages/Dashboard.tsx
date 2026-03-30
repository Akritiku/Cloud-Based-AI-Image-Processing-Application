import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Download, 
  ExternalLink, 
  Calendar, 
  Layout, 
  Palette, 
  Home,
  Loader2,
  PlusCircle,
  History,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DesignConcept } from '../types';

export default function Dashboard({ user }: { user: User }) {
  const [designs, setDesigns] = useState<DesignConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, [user]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'designs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedDesigns = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DesignConcept[];
      setDesigns(fetchedDesigns);
    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'designs', id));
      setDesigns(designs.filter(d => d.id !== id));
    } catch (error) {
      console.error("Error deleting design:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your gallery...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-600" />
            My Design Gallery
          </h1>
          <p className="text-slate-500">You have generated {designs.length} interior concepts.</p>
        </div>
        <Link 
          to="/upload"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Create New Design
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layout className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No designs yet</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Start your first interior redesign project and see the magic happen!
          </p>
          <Link 
            to="/upload"
            className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2"
          >
            Get started now <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {designs.map((design) => (
              <motion.div 
                key={design.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={design.generatedImageUrl} 
                    alt={design.style} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleDownload(design.generatedImageUrl, `design-${design.id}`)}
                        className="flex-1 bg-white/90 hover:bg-white text-slate-900 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button 
                        onClick={() => handleDelete(design.id)}
                        disabled={deletingId === design.id}
                        className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                      >
                        {deletingId === design.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">
                    {design.style}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Home className="w-4 h-4 text-indigo-600" />
                      <span className="capitalize">{design.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      <Palette className="w-3 h-3" /> {design.colorTheme}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" /> {design.style}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
