import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  User, 
  Plus,
  Truck,
  Trash2,
  Calendar
} from 'lucide-react';
import type { VolunteerTask, UserAccount } from '../types/ecosort.ts';
import { completeVolunteerTask } from '../services/apiClient.ts';

interface VolunteerOperationsProps {
  tasks: VolunteerTask[];
  currentUser: UserAccount;
  onRefreshData: () => void;
}

export const VolunteerOperations: React.FC<VolunteerOperationsProps> = ({
  tasks,
  currentUser,
  onRefreshData
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleComplete = async (taskId: string) => {
    try {
      setIsUpdating(taskId);
      await completeVolunteerTask(taskId, currentUser.name);
      onRefreshData();
    } catch (err: any) {
      alert('Error updating task: ' + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Field Ops Coordination · Campus Green Team
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Volunteer Operations & Task Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Coordinate physical bin collections, hazardous safe-drop inspections, and campus recycling audits.
          </p>
        </div>

        {/* Task filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({tasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Task Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map(task => {
          const isDone = task.status === 'completed';
          const isHigh = task.priority === 'high';

          return (
            <div 
              key={task.id}
              className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isDone 
                  ? 'border-slate-800 bg-slate-950/40 opacity-70' 
                  : isHigh 
                  ? 'border-red-900/60 bg-slate-900/60 shadow-lg'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-slate-700/30 text-slate-300 border-slate-600/30'
                  }`}>
                    {task.priority} Priority · #{task.id}
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {task.dueDate}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white">
                  {task.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {task.station}
                  </span>
                  {task.itemsCount && (
                    <span>· ~{task.itemsCount} items estimated</span>
                  )}
                </div>

                {task.assignedToName && (
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Assigned: <span className="text-slate-200">{task.assignedToName}</span>
                  </div>
                )}
              </div>

              {/* Action Button Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className={`text-xs font-mono uppercase font-semibold ${
                  isDone ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>

                {!isDone ? (
                  <button
                    disabled={isUpdating === task.id}
                    onClick={() => handleComplete(task.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isUpdating === task.id ? 'Updating...' : 'Mark Completed'}
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Verified Done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
