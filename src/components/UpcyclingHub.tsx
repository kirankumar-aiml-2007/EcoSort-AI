import React, { useState } from 'react';
import { 
  Sparkles, 
  Leaf, 
  Recycle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  ExternalLink,
  Tag,
  Award
} from 'lucide-react';

interface DIYProject {
  id: string;
  title: string;
  material: string;
  stream: 'recyclable' | 'reusable' | 'biodegradable' | 'hazardous';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  timeMin: number;
  co2SavedKg: number;
  summary: string;
  materialsNeeded: string[];
  steps: string[];
}

const SAMPLE_PROJECTS: DIYProject[] = [
  {
    id: 'up-1',
    title: 'Self-Watering Herb Planter from 2L PET Bottle',
    material: 'PET Plastic #1 (Blue Stream)',
    stream: 'recyclable',
    difficulty: 'Easy',
    timeMin: 15,
    co2SavedKg: 1.8,
    summary: 'Transform a single-use plastic soda or juice bottle into an automated wick-fed indoor herb garden for basil or mint.',
    materialsNeeded: ['Clean 2L plastic bottle', 'Cotton string or shoe lace', 'Potting soil', 'Herb seedlings or seeds'],
    steps: [
      'Cut the plastic bottle in half horizontally about 4 inches from the cap.',
      'Punch a small hole in the cap and thread the cotton wick through, leaving 2 inches dangling.',
      'Invert the top half into the bottom reservoir base and fill the top with potting soil.',
      'Plant your herb seedling and pour water into the lower reservoir. The wick draws moisture upwards automatically.'
    ]
  },
  {
    id: 'up-2',
    title: 'Kitchen Desk Organizer from Rinsed Aluminum Cans',
    material: 'Aluminum & Tin (Blue Stream)',
    stream: 'recyclable',
    difficulty: 'Easy',
    timeMin: 20,
    co2SavedKg: 2.3,
    summary: 'Turn discarded soup and soda cans into a sleek modular desktop caddy for pens, scissors, and cables.',
    materialsNeeded: ['3-4 empty tin/aluminum cans', 'Sandpaper for smooth edges', 'Non-toxic spray paint or twine wrap', 'Epoxy or hot glue'],
    steps: [
      'Remove labels, wash thoroughly with warm soapy water, and allow to dry completely.',
      'Use fine-grit sandpaper to remove any burrs along the inner rim.',
      'Wrap exterior with natural jute twine or apply a matte black coat of paint.',
      'Glue the cans together in a triangle cluster to create a stable desk organizer.'
    ]
  },
  {
    id: 'up-3',
    title: 'Cable Storage Sleeves from Cardboard Rolls',
    material: 'Cardboard Core (Blue/Brown Stream)',
    stream: 'biodegradable',
    difficulty: 'Easy',
    timeMin: 10,
    co2SavedKg: 0.6,
    summary: 'Prevent tangled charging cables and earphone wires using discarded paper towel and toilet roll cores.',
    materialsNeeded: ['Empty cardboard tubes', 'Washi tape or marker', 'Scissors'],
    steps: [
      'Cut tubes to appropriate length matching your power cords.',
      'Neatly coil cords and slide inside the cardboard sleeve.',
      'Label each roll with the device name (e.g. "USB-C", "Laptop Charger").'
    ]
  },
  {
    id: 'up-4',
    title: 'E-Waste Cable Repurposing into Heavy-Duty Zip Ties',
    material: 'E-Waste Copper Core (Red Stream)',
    stream: 'hazardous',
    difficulty: 'Moderate',
    timeMin: 25,
    co2SavedKg: 3.1,
    summary: 'Strip insulation from non-working USB cables to create durable reusable copper plant ties and cable ties.',
    materialsNeeded: ['Broken USB cable', 'Wire stripper or utility knife', 'Pliers'],
    steps: [
      'Inspect the cable to confirm it is completely disconnected from any power source.',
      'Gently score and strip outer PVC layer to expose insulated copper wires.',
      'Use the flexible copper gauge wires as reusable plant ties for balcony gardens or cable tidies.'
    ]
  }
];

export const UpcyclingHub: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<DIYProject>(SAMPLE_PROJECTS[0]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);

  const handleToggleComplete = (id: string) => {
    if (completedProjects.includes(id)) {
      setCompletedProjects(prev => prev.filter(p => p !== id));
    } else {
      setCompletedProjects(prev => [...prev, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <Recycle className="w-4 h-4" />
            Circularity First · Upcycling & DIY Crafts
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Upcycling & Reuse DIY Hub
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Before tossing items in the recycling bin, explore creative step-by-step ways to give packaging a second functional life and divert landfill emissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Selector List */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Featured Upcycling Blueprints
          </div>

          <div className="space-y-3">
            {SAMPLE_PROJECTS.map(proj => {
              const isSelected = selectedProject.id === proj.id;
              const isDone = completedProjects.includes(proj.id);

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 shadow-lg'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] font-mono text-emerald-400">{proj.material}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {proj.difficulty} · {proj.timeMin}m
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {proj.title}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>-{proj.co2SavedKg} kg CO2</span>
                    {isDone && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Project Full Guide */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Step-by-Step Blueprint
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                {selectedProject.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedProject.summary}
              </p>
            </div>

            <button
              onClick={() => handleToggleComplete(selectedProject.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                completedProjects.includes(selectedProject.id)
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedProjects.includes(selectedProject.id) ? 'Completed (+25 pts)' : 'Mark as Completed'}</span>
            </button>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Difficulty</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedProject.difficulty}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Time Needed</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedProject.timeMin} minutes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Carbon Avoidance</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">-{selectedProject.co2SavedKg} kg CO2</div>
            </div>
          </div>

          {/* Materials */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              Materials & Tools Required
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedProject.materialsNeeded.map((mat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{mat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 font-semibold">
              Instructions
            </h4>
            <div className="space-y-3">
              {selectedProject.steps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
