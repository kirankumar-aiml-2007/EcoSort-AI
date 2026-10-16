import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import type { ReuseListing, UserAccount } from '../types/ecosort.ts';
import { fetchReuseListings, claimReuseListing, createReuseListing } from '../services/apiClient.ts';

interface ReuseMarketplaceProps {
  currentUser: UserAccount;
}

export const ReuseMarketplace: React.FC<ReuseMarketplaceProps> = ({ currentUser }) => {
  const [listings, setListings] = useState<ReuseListing[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Drinkware');
  const [newCondition, setNewCondition] = useState<'like_new' | 'good' | 'fair'>('like_new');
  const [newLocker, setNewLocker] = useState('Station A · Locker #04');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchReuseListings().then(setListings).catch(() => {});
  }, []);

  const handleClaim = async (listingId: string) => {
    try {
      await claimReuseListing(listingId, currentUser.name);
      setNotification('Item reserved! Locker PIN sent to your email.');
      setTimeout(() => setNotification(null), 4000);
      fetchReuseListings().then(setListings);
    } catch (err: any) {
      alert('Error reserving item: ' + err.message);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await createReuseListing({
        title: newTitle,
        category: newCategory,
        condition: newCondition,
        description: newDescription,
        donorName: currentUser.name,
        stationLocker: newLocker,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80'
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNotification('Item listed in campus reuse locker! +20 Eco-Credits awarded.');
      setTimeout(() => setNotification(null), 5000);
      fetchReuseListings().then(setListings);
    } catch (err: any) {
      alert('Error listing item: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase()) ||
    l.stationLocker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Green Stream · Campus Peer-to-Peer Locker Swap
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Peer Reuse & Locker Exchange
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Don’t throw away intact mugs, bottles, containers, or tote bags. Drop them in campus smart lockers for peers to claim for free.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item to Swap</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reusable items (mugs, tumblers, boxes)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          {filtered.length} Reusable items active across lockers
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => {
          const isClaimed = item.status === 'claimed';

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                    isClaimed ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pickup: {item.stationLocker}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Shared by {item.donorName} · Condition: <span className="text-slate-200 capitalize">{item.condition.replace('_', ' ')}</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400">Free Campus Reuse</span>
                <button
                  type="button"
                  disabled={isClaimed}
                  onClick={() => handleClaim(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isClaimed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isClaimed ? 'Claimed' : 'Reserve Locker Pickup'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 mb-1">
                Share Packaging or Container
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                List an Item in Campus Smart Locker
              </h3>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stainless Steel Thermal Mug (500ml)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Drinkware">Drinkware & Tumblers</option>
                    <option value="Containers">Glass & Metal Containers</option>
                    <option value="Bags">Canvas & Tote Bags</option>
                    <option value="Accessories">Cables & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                  <select
                    value={newCondition}
                    onChange={(e: any) => setNewCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="like_new">Like New</option>
                    <option value="good">Good Condition</option>
                    <option value="fair">Fair (Clean & Usable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Locker Station Location</label>
                <select
                  value={newLocker}
                  onChange={(e) => setNewLocker(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="Station A · Locker #04 (Student Center)">Station A · Locker #04 (Student Center)</option>
                  <option value="Station B · Locker #11 (Engineering Cafeteria)">Station B · Locker #11 (Engineering Cafeteria)</option>
                  <option value="Station C · Locker #02 (Science Innovation Hub)">Station C · Locker #02 (Science Innovation Hub)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Sanitization Note</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Rinsed with hot water, no scratches, ready for pickup."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  {isSubmitting ? 'Listing...' : 'List in Locker (+20 pts)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
