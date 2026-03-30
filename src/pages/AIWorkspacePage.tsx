import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  Image as ImageIcon, 
  FileText, 
  Layout, 
  Sparkles, 
  Search, 
  History,
  Loader2,
  PenTool
} from 'lucide-react';

export default function AIWorkspacePage({ user }: { user: User }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'floorplans'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    try {
      const docRef = await addDoc(collection(db, 'floorplans'), {
        userId: user.uid,
        name: 'Untitled Project',
        data: JSON.stringify({ walls: [], furniture: [] }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate(`/editor/${docRef.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Create a Floor Plan</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: <ImageIcon className="w-6 h-6" />, label: "Import Image", sub: "Upload photo" },
            { icon: <FileText className="w-6 h-6" />, label: "Import CAD", sub: "DWG/DXF" },
            { icon: <PenTool className="w-6 h-6" />, label: "New Design", sub: "Start from scratch", primary: true, action: createNewProject },
            { icon: <Layout className="w-6 h-6" />, label: "Templates", sub: "Pre-made rooms" },
            { icon: <Sparkles className="w-6 h-6" />, label: "AI Planner", sub: "Smart design" }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
                item.primary 
                  ? 'border-orange-500 bg-white shadow-lg shadow-orange-100' 
                  : 'border-slate-100 bg-white hover:border-orange-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                item.primary ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'
              }`}>
                {item.icon}
              </div>
              <span className="font-bold text-slate-900 text-sm mb-1">{item.label}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            My Designs
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search your designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-24 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No designs found</h3>
            <button 
              onClick={createNewProject}
              className="text-orange-500 font-bold hover:underline"
            >
              Start your first design
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Link 
                key={project.id}
                to={`/editor/${project.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <Layout className="w-12 h-12 text-slate-200 group-hover:text-orange-200 transition-colors" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 mb-1 truncate">{project.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
