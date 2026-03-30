import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Layout, LogIn, User as UserIcon, LogOut, Home, Grid, PlusCircle, Sparkles } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import StartDesigningPage from './pages/StartDesigningPage';
import AIWorkspacePage from './pages/AIWorkspacePage';
import EditorPage from './pages/EditorPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date().toISOString()
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/auth" element={user ? <Navigate to="/start-designing" /> : <AuthPage />} />
            <Route path="/start-designing" element={user ? <StartDesigningPage /> : <Navigate to="/auth" />} />
            <Route path="/ai-workspace" element={user ? <AIWorkspacePage user={user} /> : <Navigate to="/auth" />} />
            <Route path="/editor/:id" element={user ? <EditorPage user={user} /> : <Navigate to="/auth" />} />
            <Route path="/upload" element={user ? <UploadPage user={user} /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function Navbar({ user }: { user: User | null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight text-slate-900">DesignPro</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">AI Interior Studio</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Home
            </Link>
            {user && (
              <>
                <Link to="/start-designing" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Design
                </Link>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1.5">
                  <Grid className="w-4 h-4" /> Dashboard
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} AI Interior Designer. Powered by Gemini AI.
        </p>
      </div>
    </footer>
  );
}
