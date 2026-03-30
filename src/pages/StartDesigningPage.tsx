import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layout, Sparkles, ArrowLeft, Box, Image as ImageIcon } from 'lucide-react';

export default function StartDesigningPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Start Your <span className="text-orange-500">Design Journey</span>
          </h1>
          <p className="text-xl text-slate-300 mb-16 max-w-2xl mx-auto leading-relaxed">
            Choose your path to create the perfect space. Whether you're building from scratch or using AI to reimagine a room.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Option 1: Interactive 3D Workspace */}
          <Link to="/ai-workspace" className="group">
            <motion.div
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-left transition-all hover:bg-white/10 hover:border-white/20 h-full flex flex-col"
            >
              <div className="bg-orange-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-500/30 transition-colors">
                <Layout className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Interactive 3D Workspace</h3>
              <p className="text-slate-400 mb-8 flex-grow">
                The professional's choice. Design floor plans, drag-and-drop furniture, and visualize your space in real-time with our 2D/3D editor. Perfect for renovations and new builds.
              </p>
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-2"><Box className="w-4 h-4" /> 3D Floor Plans</span>
                <span className="flex items-center gap-2"><Layout className="w-4 h-4" /> Furniture Library</span>
              </div>
            </motion.div>
          </Link>

          {/* Option 2: AI Design Studio */}
          <Link to="/upload" className="group">
            <motion.div
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-left transition-all hover:bg-white/10 hover:border-white/20 h-full flex flex-col"
            >
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-500/30 transition-colors">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Design Studio</h3>
              <p className="text-slate-400 mb-8 flex-grow">
                The fastest way to see results. Upload a photo of your existing room and let our AI transform it into stunning professional renders across different styles instantly.
              </p>
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Photo Transformation</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Style Engine</span>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
