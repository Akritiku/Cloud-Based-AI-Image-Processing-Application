import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Sparkles, Image as ImageIcon, Layout, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage({ user }: { user: User | null }) {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100">
                <Sparkles className="w-4 h-4" />
                AI-Powered Interior Design
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                Transform Your Space with <span className="text-indigo-600">AI Magic</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Upload a photo of your room and watch as our AI generates stunning interior design concepts in seconds. Professional design, accessible to everyone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to={user ? "/upload" : "/auth"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1"
                >
                  Start Redesigning <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  View Gallery
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to your dream interior.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <ImageIcon className="w-8 h-8 text-indigo-600" />,
                title: "Upload Photo",
                desc: "Snap a photo of your current room from any angle. Our AI handles the rest."
              },
              {
                icon: <Layout className="w-8 h-8 text-indigo-600" />,
                title: "Choose Style",
                desc: "Select from Modern, Minimalist, Scandinavian, and more to match your taste."
              },
              {
                icon: <Zap className="w-8 h-8 text-indigo-600" />,
                title: "Get Concepts",
                desc: "Receive high-quality redesign concepts in seconds. Compare and download."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
              >
                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to see your room transformed?</h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of homeowners and designers using AI to visualize their future spaces.</p>
              <Link 
                to={user ? "/upload" : "/auth"}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500 rounded-full opacity-20"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400 rounded-full opacity-20"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
