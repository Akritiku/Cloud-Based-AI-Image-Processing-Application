import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  ChevronLeft, 
  Save, 
  Undo, 
  Redo, 
  Trash2, 
  Copy, 
  Square, 
  MousePointer2, 
  Hand, 
  PenTool, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Sparkles,
  Layout,
  Box,
  Palette,
  Settings,
  User as UserIcon,
  Plus,
  Image as ImageIcon,
  FileText,
  Smartphone,
  Grid,
  Eye,
  Layers,
  Info,
  ChevronRight,
  Download,
  Share2,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle, Group } from 'react-konva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid as ThreeGrid, PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Wall {
  id: string;
  points: number[]; // [x1, y1, x2, y2]
  thickness: number;
  height: number;
}

interface Furniture {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  icon?: string;
}

interface ProjectData {
  walls: Wall[];
  furniture: Furniture[];
}

const FURNITURE_LIBRARY = [
  { id: 'sofa', name: 'Luxury Sofa', type: 'sofa', width: 200, height: 80, depth: 90, color: '#475569', icon: '🛋️' },
  { id: 'bed', name: 'King Bed', type: 'bed', width: 180, height: 60, depth: 200, color: '#94a3b8', icon: '🛏️' },
  { id: 'table', name: 'Dining Table', type: 'table', width: 120, height: 75, depth: 120, color: '#78350f', icon: '🍽️' },
  { id: 'chair', name: 'Office Chair', type: 'chair', width: 60, height: 100, depth: 60, color: '#1e293b', icon: '💺' },
  { id: 'desk', name: 'Work Desk', type: 'desk', width: 140, height: 75, depth: 70, color: '#451a03', icon: '🖥️' },
  { id: 'plant', name: 'Indoor Plant', type: 'plant', width: 40, height: 120, depth: 40, color: '#166534', icon: '🌿' },
];

const FLAT_TEMPLATES = {
  '1RK Studio': {
    walls: [
      { id: 'w1', points: [100, 100, 500, 100], thickness: 8, height: 280 },
      { id: 'w2', points: [500, 100, 500, 400], thickness: 8, height: 280 },
      { id: 'w3', points: [500, 400, 100, 400], thickness: 8, height: 280 },
      { id: 'w4', points: [100, 400, 100, 100], thickness: 8, height: 280 },
    ],
    furniture: [
      { id: 'f1', type: 'bed', name: 'King Bed', x: 200, y: 200, rotation: 0, width: 180, height: 60, depth: 200, color: '#94a3b8' },
      { id: 'f2', type: 'sofa', name: 'Luxury Sofa', x: 400, y: 300, rotation: Math.PI / 2, width: 200, height: 80, depth: 90, color: '#475569' }
    ]
  },
  '1BHK Flat': {
    walls: [
      { id: 'w1', points: [100, 100, 700, 100], thickness: 8, height: 280 },
      { id: 'w2', points: [700, 100, 700, 500], thickness: 8, height: 280 },
      { id: 'w3', points: [700, 500, 100, 500], thickness: 8, height: 280 },
      { id: 'w4', points: [100, 500, 100, 100], thickness: 8, height: 280 },
      { id: 'w5', points: [400, 100, 400, 500], thickness: 8, height: 280 }, // Partition
    ],
    furniture: [
      { id: 'f1', type: 'bed', name: 'King Bed', x: 250, y: 250, rotation: 0, width: 180, height: 60, depth: 200, color: '#94a3b8' },
      { id: 'f2', type: 'sofa', name: 'Luxury Sofa', x: 550, y: 300, rotation: 0, width: 200, height: 80, depth: 90, color: '#475569' },
      { id: 'f3', type: 'table', name: 'Dining Table', x: 550, y: 150, rotation: 0, width: 120, height: 75, depth: 120, color: '#78350f' }
    ]
  },
  '2BHK Apartment': {
    walls: [
      { id: 'w1', points: [100, 100, 900, 100], thickness: 8, height: 280 },
      { id: 'w2', points: [900, 100, 900, 600], thickness: 8, height: 280 },
      { id: 'w3', points: [900, 600, 100, 600], thickness: 8, height: 280 },
      { id: 'w4', points: [100, 600, 100, 100], thickness: 8, height: 280 },
      { id: 'w5', points: [400, 100, 400, 600], thickness: 8, height: 280 },
      { id: 'w6', points: [100, 350, 400, 350], thickness: 8, height: 280 },
    ],
    furniture: [
      { id: 'f1', type: 'bed', name: 'King Bed', x: 250, y: 225, rotation: 0, width: 180, height: 60, depth: 200, color: '#94a3b8' },
      { id: 'f2', type: 'bed', name: 'King Bed', x: 250, y: 475, rotation: 0, width: 180, height: 60, depth: 200, color: '#94a3b8' },
      { id: 'f3', type: 'sofa', name: 'Luxury Sofa', x: 650, y: 350, rotation: 0, width: 200, height: 80, depth: 90, color: '#475569' }
    ]
  }
};

// --- 3D Components ---

function Wall3D({ wall }: { wall: Wall }) {
  const x1 = wall.points[0];
  const y1 = wall.points[1];
  const x2 = wall.points[2];
  const y2 = wall.points[3];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  const scale = 0.01;

  return (
    <mesh position={[centerX * scale, (wall.height * scale) / 2, centerY * scale]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length * scale, wall.height * scale, wall.thickness * scale]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function Furniture3D({ item }: { item: Furniture }) {
  const scale = 0.01;
  const { type, width, height, depth, color, rotation } = item;

  // Basic representation based on type
  if (type === 'sofa') {
    return (
      <group position={[item.x * scale, 0, item.y * scale]} rotation={[0, -rotation, 0]} castShadow>
        {/* Base */}
        <mesh position={[0, (height * scale) / 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * scale, (height * scale) / 2, depth * scale]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, (height * scale) * 0.75, -(depth * scale) / 3]} castShadow receiveShadow>
          <boxGeometry args={[width * scale, (height * scale) / 2, (depth * scale) / 3]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
        </mesh>
      </group>
    );
  }

  if (type === 'bed') {
    return (
      <group position={[item.x * scale, 0, item.y * scale]} rotation={[0, -rotation, 0]} castShadow>
        {/* Mattress */}
        <mesh position={[0, (height * scale) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * scale, height * scale, depth * scale]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
        </mesh>
        {/* Headboard */}
        <mesh position={[0, (height * scale) * 1.5, -(depth * scale) / 2 + (depth * scale) * 0.05]} castShadow receiveShadow>
          <boxGeometry args={[width * scale, height * scale * 2, (depth * scale) * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[item.x * scale, (item.height * scale) / 2, item.y * scale]} rotation={[0, -item.rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={[item.width * scale, item.height * scale, item.depth * scale]} />
      <meshStandardMaterial color={item.color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

function Scene3D({ data }: { data: ProjectData }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.05} />
      </mesh>

      <ThreeGrid 
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionColor="#94a3b8" 
        cellColor="#cbd5e1" 
      />

      {data.walls.map(wall => (
        <Wall3D key={wall.id} wall={wall} />
      ))}

      {data.furniture.map(item => (
        <Furniture3D key={item.id} item={item} />
      ))}

      <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
      <Environment preset="city" />
    </>
  );
}

// --- Main Editor Component ---

export default function EditorPage({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('Untitled Project');
  const [data, setData] = useState<ProjectData>({ walls: [], furniture: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [tool, setTool] = useState<'select' | 'wall' | 'pan' | 'furniture'>('select');
  const [sidebarTab, setSidebarTab] = useState<'build' | 'decorate' | 'ai' | 'customize' | 'my'>('build');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<any>(null);
  
  const [newWall, setNewWall] = useState<number[] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [globalWallHeight, setGlobalWallHeight] = useState(280);
  const [globalWallThickness, setGlobalWallThickness] = useState(8);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleAiDesign = async () => {
    setAiGenerating(true);
    // Simulate AI generation with a slight delay
    setTimeout(() => {
      if (data.walls.length === 0) {
        // If empty, generate a basic 1BHK layout
        const template = FLAT_TEMPLATES['1BHK Flat'];
        updateData({
          walls: template.walls.map(w => ({ ...w, id: Math.random().toString(36).substr(2, 9) })),
          furniture: template.furniture.map(f => ({ ...f, id: Math.random().toString(36).substr(2, 9) }))
        });
        alert("AI has generated a smart 1BHK layout for you!");
      } else {
        // If not empty, suggest additional decor
        const suggestedFurniture: Furniture[] = [
          { id: Math.random().toString(36).substr(2, 9), type: 'plant', name: 'Indoor Plant', x: 120, y: 120, rotation: 0, width: 40, height: 120, depth: 40, color: '#166534' },
          { id: Math.random().toString(36).substr(2, 9), type: 'chair', name: 'Office Chair', x: 450, y: 150, rotation: Math.PI, width: 60, height: 100, depth: 60, color: '#1e293b' }
        ];
        updateData(prev => ({ ...prev, furniture: [...prev.furniture, ...suggestedFurniture] }));
        alert("AI has suggested some furniture placements based on your current layout!");
      }
      setAiGenerating(false);
    }, 1500);
  };

  const addToHistory = (newData: ProjectData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setData(history[prevIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setData(history[nextIndex]);
    }
  };

  const updateData = (newData: ProjectData | ((prev: ProjectData) => ProjectData)) => {
    setData(prev => {
      const next = typeof newData === 'function' ? newData(prev) : newData;
      addToHistory(next);
      return next;
    });
  };

  const fetchProject = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, 'floorplans', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const project = docSnap.data();
        setProjectName(project.name);
        const initialData = JSON.parse(project.data);
        setData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'floorplans', id);
      await updateDoc(docRef, {
        name: projectName,
        data: JSON.stringify(data),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const x = (point.x - stagePos.x) / zoom;
    const y = (point.y - stagePos.y) / zoom;

    if (tool === 'wall') {
      setNewWall([x, y, x, y]);
    } else if (tool === 'furniture' && selectedFurniture) {
      const newItem: Furniture = {
        ...selectedFurniture,
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        rotation: 0
      };
      updateData(prev => ({ ...prev, furniture: [...prev.furniture, newItem] }));
      setTool('select');
      setSelectedFurniture(null);
    } else if (tool === 'select') {
      const clickedId = e.target.id();
      setSelectedId(clickedId || null);
    }
  };

  const applyTemplate = (name: string) => {
    const template = (FLAT_TEMPLATES as any)[name];
    if (template) {
      updateData({
        walls: template.walls.map((w: any) => ({ ...w, id: Math.random().toString(36).substr(2, 9) })),
        furniture: template.furniture.map((f: any) => ({ ...f, id: Math.random().toString(36).substr(2, 9) }))
      });
    }
  };

  const applyRoomTemplate = (type: string) => {
    // Basic room template: 4 walls in a square
    const size = 300;
    const offset = 200;
    const newWalls = [
      { id: Math.random().toString(36).substr(2, 9), points: [offset, offset, offset + size, offset], thickness: 8, height: 280 },
      { id: Math.random().toString(36).substr(2, 9), points: [offset + size, offset, offset + size, offset + size], thickness: 8, height: 280 },
      { id: Math.random().toString(36).substr(2, 9), points: [offset + size, offset + size, offset, offset + size], thickness: 8, height: 280 },
      { id: Math.random().toString(36).substr(2, 9), points: [offset, offset + size, offset, offset], thickness: 8, height: 280 },
    ];
    updateData(prev => ({ ...prev, walls: [...prev.walls, ...newWalls] }));
  };

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.walls.find(w => w.id === selectedId) || data.furniture.find(f => f.id === selectedId);
  }, [selectedId, data]);

  const updateSelectedItem = (updates: any) => {
    if (!selectedId) return;
    updateData(prev => ({
      walls: prev.walls.map(w => w.id === selectedId ? { ...w, ...updates } : w),
      furniture: prev.furniture.map(f => f.id === selectedId ? { ...f, ...updates } : f)
    }));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    updateData(prev => ({
      walls: prev.walls.filter(w => w.id !== selectedId),
      furniture: prev.furniture.filter(f => f.id !== selectedId)
    }));
    setSelectedId(null);
  };

  const handleMouseMove = (e: any) => {
    if (tool === 'wall' && newWall) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = (point.x - stagePos.x) / zoom;
      const y = (point.y - stagePos.y) / zoom;
      setNewWall([newWall[0], newWall[1], x, y]);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'wall' && newWall) {
      const wall: Wall = {
        id: Math.random().toString(36).substr(2, 9),
        points: newWall,
        thickness: globalWallThickness,
        height: globalWallHeight
      };
      updateData(prev => ({ ...prev, walls: [...prev.walls, wall] }));
      setNewWall(null);
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear all walls and furniture?")) {
      updateData({ walls: [], furniture: [] });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/ai-workspace" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-bold text-slate-900 border-none p-0 focus:ring-0 w-48 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-4">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 disabled:opacity-30"><Undo className="w-4 h-4" /></button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500 disabled:opacity-30"><Redo className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button onClick={clearAll} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"><Trash2 className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"><Copy className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-4">
            <button onClick={() => setZoom(z => z * 0.9)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-[10px] font-bold text-slate-500 px-2 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => z * 1.1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"><ZoomIn className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"><Maximize className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-4">
            <button 
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === '2D' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Floor Plan
            </button>
            <button 
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === '3D' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              3D View
            </button>
          </div>

          <button 
            onClick={handleAiDesign}
            disabled={aiGenerating}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
          >
            {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Design
          </button>
          
          <button 
            onClick={saveProject}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar Icons */}
        <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 z-20">
          {[
            { id: 'build', icon: <Layout className="w-5 h-5" />, label: 'Build' },
            { id: 'decorate', icon: <Box className="w-5 h-5" />, label: 'Decorate' },
            { id: 'ai', icon: <Sparkles className="w-5 h-5" />, label: 'AI Decor' },
            { id: 'customize', icon: <Palette className="w-5 h-5" />, label: 'Customize' },
            { id: 'my', icon: <UserIcon className="w-5 h-5" />, label: 'My' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setSidebarTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 group transition-all ${sidebarTab === tab.id ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-2.5 rounded-xl transition-all ${sidebarTab === tab.id ? 'bg-orange-50 shadow-sm' : 'group-hover:bg-slate-50'}`}>
                {tab.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Left Panel Content */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10 overflow-y-auto">
          <div className="p-6">
            {sidebarTab === 'build' && (
              <>
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 italic">
                  Create Room
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button 
                    onClick={() => setSidebarTab('build')}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200 transition-all group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 mb-2 flex items-center gap-1">Templates <ChevronRight className="w-3 h-3 text-slate-400" /></div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-4 h-4 bg-slate-200 rounded-sm"></div>
                    </div>
                  </button>
                  <button 
                    onClick={() => alert("Import CAD/Image feature coming soon!")}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200 transition-all group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 mb-2 flex items-center gap-1">Import <ChevronRight className="w-3 h-3 text-slate-400" /></div>
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-slate-300 group-hover:text-orange-500" />
                    </div>
                  </button>
                </div>

                <div 
                  onClick={handleAiDesign}
                  className="bg-indigo-50 rounded-2xl p-4 mb-4 border border-indigo-100 relative overflow-hidden group cursor-pointer hover:bg-indigo-100 transition-all"
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">AI Planner</div>
                      <div className="text-[9px] text-slate-500">Smart layout generator</div>
                    </div>
                    <div className="ml-auto bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                  </div>
                </div>

                <button 
                  onClick={() => alert("RoomScan AR feature requires mobile app.")}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200 transition-all mb-8"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-900">RoomScan</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                </button>

                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Global Wall Config</h4>
                  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-600">Thickness ({globalWallThickness}cm)</label>
                      </div>
                      <input 
                        type="range" min="5" max="30" step="1"
                        value={globalWallThickness}
                        onChange={(e) => setGlobalWallThickness(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-600">Height ({globalWallHeight}cm)</label>
                      </div>
                      <input 
                        type="range" min="100" max="400" step="10"
                        value={globalWallHeight}
                        onChange={(e) => setGlobalWallHeight(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        updateData(prev => ({
                          ...prev,
                          walls: prev.walls.map(w => ({ ...w, thickness: globalWallThickness, height: globalWallHeight }))
                        }));
                      }}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all"
                    >
                      Apply to All Walls
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Flat Templates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: '🏠', label: '1RK Studio' },
                      { icon: '🏢', label: '1BHK Flat' },
                      { icon: '🏰', label: '2BHK Apartment' }
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => applyTemplate(item.label)}
                        className="flex flex-col items-center p-2 rounded-xl border border-slate-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all"
                      >
                        <span className="text-xl mb-1">{item.icon}</span>
                        <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Room Templates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: '🛋️', label: 'Living Room' },
                      { icon: '🛏️', label: 'Bedroom' },
                      { icon: '🍳', label: 'Kitchen' }
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => applyRoomTemplate(item.label)}
                        className="flex flex-col items-center p-2 rounded-xl border border-slate-50 hover:border-orange-100 hover:bg-orange-50/30 transition-all"
                      >
                        <span className="text-xl mb-1">{item.icon}</span>
                        <span className="text-[8px] font-bold text-slate-600 text-center leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {sidebarTab === 'decorate' && (
              <>
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 italic">
                  Furniture Library
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {FURNITURE_LIBRARY.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setTool('furniture');
                        setSelectedFurniture(item);
                      }}
                      className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${selectedFurniture?.id === item.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-orange-200'}`}
                    >
                      <span className="text-3xl mb-2">{item.icon}</span>
                      <span className="text-[10px] font-bold text-slate-900 text-center">{item.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {sidebarTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 italic">
                  AI Decorator
                </h3>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Select a room or area and let AI suggest furniture layouts and styles based on your preferences.
                  </p>
                </div>
                <button 
                  onClick={handleAiDesign}
                  disabled={aiGenerating}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiGenerating ? "Generating..." : "Generate Layout"}
                </button>
              </div>
            )}

            {sidebarTab === 'my' && (
              <div className="space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 italic">
                  My Designs
                </h3>
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Layout className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-center font-medium">No saved designs yet.</p>
                  <p className="text-[10px] text-center mt-2">Your creative projects will appear here.</p>
                </div>
              </div>
            )}

            {sidebarTab === 'customize' && (
              <div className="space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 italic">
                  Customize
                </h3>
                {selectedId ? (
                  <div className="space-y-6">
                    {data.walls.find(w => w.id === selectedId) && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Wall Properties</span>
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Height (cm)</label>
                              <input 
                                type="range" min="100" max="400" 
                                value={data.walls.find(w => w.id === selectedId)?.height || 250}
                                onChange={(e) => updateSelectedItem({ height: parseInt(e.target.value) })}
                                className="w-full accent-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Thickness (cm)</label>
                              <input 
                                type="range" min="5" max="30" 
                                value={data.walls.find(w => w.id === selectedId)?.thickness || 15}
                                onChange={(e) => updateSelectedItem({ thickness: parseInt(e.target.value) })}
                                className="w-full accent-slate-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {data.furniture.find(f => f.id === selectedId) && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Furniture Properties</span>
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Rotation</label>
                              <input 
                                type="range" min="0" max="360" 
                                value={(data.furniture.find(f => f.id === selectedId)?.rotation || 0) * (180 / Math.PI)}
                                onChange={(e) => updateSelectedItem({ rotation: parseInt(e.target.value) * (Math.PI / 180) })}
                                className="w-full accent-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Color</label>
                              <div className="flex gap-2">
                                {['#1e293b', '#f97316', '#3b82f6', '#10b981', '#ef4444'].map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => updateSelectedItem({ color: c })}
                                    className={`w-6 h-6 rounded-full border-2 ${data.furniture.find(f => f.id === selectedId)?.color === c ? 'border-slate-900' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={deleteSelected}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Item
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                      <MousePointer2 className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-center font-medium">Select an item to customize</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-grow relative bg-slate-100 overflow-hidden">
          {/* Canvas Tools Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-20">
            <button 
              onClick={() => setTool('select')}
              className={`p-2 rounded-lg transition-all ${tool === 'select' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTool('pan')}
              className={`p-2 rounded-lg transition-all ${tool === 'pan' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Hand className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setTool('wall')}
              className={`p-2 rounded-lg transition-all ${tool === 'wall' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <PenTool className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2 px-3">
              <ZoomOut className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setZoom(z => z * 0.9)} />
              <span className="text-[10px] font-bold text-slate-600 min-w-[35px] text-center">{Math.round(zoom * 100)}%</span>
              <ZoomIn className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setZoom(z => z * 1.1)} />
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-slate-600 transition-all">
              <Grid className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Floor Plan</span>
            </button>
          </div>

          {/* 2D/3D Viewport */}
          <div className="w-full h-full">
            {viewMode === '2D' ? (
              <Stage 
                width={window.innerWidth} 
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                draggable={tool === 'pan'}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={zoom}
                scaleY={zoom}
                onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
              >
                <Layer>
                  {/* Grid Lines */}
                  {Array.from({ length: 100 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <Line points={[i * 50, -5000, i * 50, 5000]} stroke="#e2e8f0" strokeWidth={0.5} />
                      <Line points={[-5000, i * 50, 5000, i * 50]} stroke="#e2e8f0" strokeWidth={0.5} />
                    </React.Fragment>
                  ))}

                  {/* Existing Walls */}
                  {data.walls.map(wall => (
                    <Line 
                      key={wall.id}
                      id={wall.id}
                      points={wall.points}
                      stroke={selectedId === wall.id ? "#f97316" : "#1e293b"}
                      strokeWidth={wall.thickness}
                      lineCap="round"
                      lineJoin="round"
                      onClick={() => setSelectedId(wall.id)}
                    />
                  ))}

                  {/* Furniture */}
                  {data.furniture.map(item => (
                    <Group
                      key={item.id}
                      x={item.x}
                      y={item.y}
                      rotation={item.rotation * (180 / Math.PI)}
                      draggable={tool === 'select'}
                      onDragEnd={(e) => {
                        updateSelectedItem({ x: e.target.x(), y: e.target.y() });
                      }}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <Rect
                        id={item.id}
                        width={item.width}
                        height={item.depth}
                        fill={item.color}
                        offsetX={item.width / 2}
                        offsetY={item.depth / 2}
                        stroke={selectedId === item.id ? "#f97316" : "#cbd5e1"}
                        strokeWidth={2}
                        cornerRadius={4}
                      />
                      {/* Icon/Symbol Overlay */}
                      {item.type === 'bed' && (
                        <Group offsetX={item.width / 2} offsetY={item.depth / 2}>
                          <Rect x={10} y={10} width={item.width - 20} height={40} fill="rgba(255,255,255,0.2)" />
                          <Line points={[10, 60, item.width - 10, 60]} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                        </Group>
                      )}
                      {item.type === 'sofa' && (
                        <Group offsetX={item.width / 2} offsetY={item.depth / 2}>
                          <Rect x={0} y={0} width={item.width} height={20} fill="rgba(0,0,0,0.1)" />
                          <Rect x={0} y={0} width={20} height={item.depth} fill="rgba(0,0,0,0.1)" />
                          <Rect x={item.width - 20} y={0} width={20} height={item.depth} fill="rgba(0,0,0,0.1)" />
                        </Group>
                      )}
                      {item.type === 'table' && (
                        <Group offsetX={item.width / 2} offsetY={item.depth / 2}>
                          <Circle x={item.width / 2} y={item.depth / 2} radius={Math.min(item.width, item.depth) / 3} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
                        </Group>
                      )}
                    </Group>
                  ))}

                  {/* New Wall Preview */}
                  {newWall && (
                    <Line 
                      points={newWall}
                      stroke="#f97316"
                      strokeWidth={8}
                      dash={[10, 5]}
                      lineCap="round"
                    />
                  )}
                </Layer>
              </Stage>
            ) : (
              <Canvas shadows>
                <PerspectiveCamera makeDefault position={[10, 10, 10]} />
                <Scene3D data={data} />
                <OrbitControls makeDefault />
              </Canvas>
            )}
          </div>

          {/* View Mode Toggle Bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-slate-900 rounded-xl shadow-2xl p-1 z-20">
            <button 
              onClick={() => setViewMode('2D')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === '2D' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              2D
            </button>
            <button 
              onClick={() => setViewMode('3D')}
              className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === '3D' ? 'bg-white text-slate-900 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              3D
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-orange-500" />
                Visual Preview
              </h3>
              <button onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')} className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">
                {viewMode === '2D' ? 'View 3D' : 'View 2D'}
              </button>
            </div>

            <div className="aspect-video bg-slate-100 rounded-2xl mb-8 overflow-hidden relative group border border-slate-200">
              {viewMode === '2D' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-8 h-8 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">2D Preview</span>
                  </div>
                </div>
              ) : (
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Scene3D data={data} />
                  <OrbitControls enableZoom={false} autoRotate />
                </Canvas>
              )}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                Real-time
              </div>
            </div>

            <div className="space-y-6">
              {selectedItem ? (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    {(selectedItem as any).points ? 'Wall Settings' : 'Furniture Settings'}
                  </h4>
                  
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">ID</span>
                      <span className="text-slate-900">{selectedId?.slice(0, 8)}</span>
                    </div>

                    {(selectedItem as any).points ? (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Height (cm)</span>
                            <span className="text-[10px] font-bold text-slate-900">{(selectedItem as Wall).height}</span>
                          </div>
                          <input 
                            type="range" min="100" max="400" 
                            value={(selectedItem as Wall).height}
                            onChange={(e) => updateSelectedItem({ height: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thickness (px)</span>
                            <span className="text-[10px] font-bold text-slate-900">{(selectedItem as Wall).thickness}</span>
                          </div>
                          <input 
                            type="range" min="2" max="30" 
                            value={(selectedItem as Wall).thickness}
                            onChange={(e) => updateSelectedItem({ thickness: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rotation (deg)</span>
                            <span className="text-[10px] font-bold text-slate-900">{Math.round((selectedItem as Furniture).rotation * (180 / Math.PI))}°</span>
                          </div>
                          <input 
                            type="range" min="0" max="360" 
                            value={(selectedItem as Furniture).rotation * (180 / Math.PI)}
                            onChange={(e) => updateSelectedItem({ rotation: parseInt(e.target.value) * (Math.PI / 180) })}
                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</span>
                            <input 
                              type="color" 
                              value={(selectedItem as Furniture).color}
                              onChange={(e) => updateSelectedItem({ color: e.target.value })}
                              className="w-8 h-8 rounded-lg border-none p-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <button 
                      onClick={deleteSelected}
                      className="w-full py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      Layer Settings
                    </h4>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <Info className="w-3.5 h-3.5" /> Project Info
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Total Area</span>
                          <span className="text-slate-900">600.0 sq ft</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Wall Count</span>
                          <span className="text-slate-900">{data.walls.length}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Furniture Count</span>
                          <span className="text-slate-900">{data.furniture.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-400" />
                      Global Config
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Freeze Layout</span>
                        <div className="w-8 h-4 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                        </div>
                      </div>

                      <button 
                        onClick={clearAll}
                        className="w-full py-3 rounded-xl border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Clear All
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
