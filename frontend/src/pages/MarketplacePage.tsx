import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { WasteListing } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Modal } from '../components/Modal';
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowUpDown, 
  ShieldAlert,
  Send,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
  onSelectListingForExchange?: (listing: WasteListing) => void;
}

export const MarketplacePage: React.FC<Props> = ({ setActiveTab, onSelectListingForExchange }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [minQuality, setMinQuality] = useState<number>(0);
  const [maxContam, setMaxContam] = useState<number>(50);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  
  // Exchange form
  const [requestQty, setRequestQty] = useState<number>(10);
  const [offerPrice, setOfferPrice] = useState<number>(0.5);
  const [exchangeNotes, setExchangeNotes] = useState<string>('');
  const [exchangeSubmitting, setExchangeSubmitting] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  // New Listing Form
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newCategory, setNewCategory] = useState('cotton');
  const [newSector, setNewSector] = useState('Manufacturing');
  const [newCondition, setNewCondition] = useState('sorted_clean');
  const [newQty, setNewQty] = useState<number>(20);
  const [newQuality, setNewQuality] = useState<number>(80);
  const [newContam, setNewContam] = useState<number>(5);
  const [newPrice, setNewPrice] = useState<number>(0.65);
  const [newCity, setNewCity] = useState('Ahmedabad');
  const [newHazardous, setNewHazardous] = useState(false);

  const categories = [
    'cotton', 'polyester', 'PET', 'HDPE', 'paper_fiber', 
    'wood_fiber', 'biomass', 'organic_biomass', 
    'mineral_aggregate', 'ferrous_metal', 'aluminium', 'glass'
  ];

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.listings.list({
        search,
        category,
        condition,
        city,
        min_quality: minQuality > 0 ? minQuality : undefined,
        max_contamination: maxContam < 50 ? maxContam : undefined,
        sort_by: sortBy,
        page,
        page_size: pageSize,
      });
      setListings(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, category, condition, city, sortBy, minQuality, maxContam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.listings.create({
        material_name: newMaterialName,
        material_category: newCategory,
        source_sector: newSector,
        condition: newCondition,
        quantity_tonnes: Number(newQty),
        quality_score_0_100: Number(newQuality),
        contamination_est_pct: Number(newContam),
        indicative_price_inr_per_kg: Number(newPrice),
        city: newCity,
        hazardous_flag: newHazardous,
      });
      setIsAddOpen(false);
      fetchListings();
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this waste listing?')) return;
    try {
      await api.listings.delete(id);
      fetchListings();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleOpenExchange = (listing: WasteListing) => {
    setSelectedListing(listing);
    setRequestQty(listing.quantity_tonnes);
    setOfferPrice(listing.indicative_price_inr_per_kg);
    setExchangeSuccess(false);
    setIsExchangeModalOpen(true);
  };

  const handleSubmitExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    if (!user) {
      alert('Please sign in as a Material Buyer to submit exchange requests.');
      setActiveTab('login');
      return;
    }
    setExchangeSubmitting(true);
    try {
      await api.exchanges.create({
        listing_id: selectedListing.id,
        requested_quantity_tonnes: Number(requestQty),
        offered_price_inr_per_kg: Number(offerPrice),
        notes: exchangeNotes,
      });
      setExchangeSuccess(true);
      setTimeout(() => {
        setIsExchangeModalOpen(false);
        setActiveTab('exchanges');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to submit exchange request');
    } finally {
      setExchangeSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Industrial Waste Marketplace</h1>
            <DemoDataBadge tooltip="Listings initialized from verified synthetic demo dataset." />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Searchable catalogue of industrial by-products, scrap streams, and secondary raw materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'supplier' || user?.role === 'admin') && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>List Waste Material</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by material, supplier, chemical/polymer grade, city..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-medium transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {/* Category */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Material Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Categories (12)</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Condition</label>
            <select
              value={condition}
              onChange={(e) => { setCondition(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Conditions</option>
              <option value="clean_dry">Clean & Dry</option>
              <option value="sorted_clean">Sorted Clean</option>
              <option value="dry_clean">Dry Clean</option>
              <option value="fresh_segregated">Fresh Segregated</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Location / Cluster</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Industrial Cities</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Bharuch">Bharuch</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Anand">Anand</option>
              <option value="Mehsana">Mehsana</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Morbi">Morbi</option>
            </select>
          </div>

          {/* Min Quality */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Min Quality</span>
              <span className="font-mono text-emerald-400">{minQuality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minQuality}
              onChange={(e) => setMinQuality(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Max Contamination */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Max Contam</span>
              <span className="font-mono text-amber-400">{maxContam}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="2"
              value={maxContam}
              onChange={(e) => setMaxContam(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="created_at">Latest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quality_desc">Quality: Highest First</option>
              <option value="quantity_desc">Quantity: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Querying marketplace listings...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Matching Waste Lots Found</h3>
          <p className="text-slate-400 text-xs mt-1">Try relaxing your quality or contamination filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const isOwner = user?.id === item.supplier_id || user?.role === 'admin';
            const isAvailable = item.listing_status === 'Available';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-slate-950/50 group"
              >
                <div>
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20 font-mono uppercase">
                      {item.material_category}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                      item.listing_status === 'Available'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.listing_status === 'Under Review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.listing_status === 'Available' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                      {item.listing_status === 'Under Review' && <Clock className="w-3 h-3 text-amber-400" />}
                      <span>{item.listing_status}</span>
                    </span>
                  </div>

                  {/* Title & Supplier */}
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {item.material_name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{item.supplier_name}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.city}
                    </span>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-850 p-3 rounded-xl border border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">Available</p>
                      <p className="text-xs font-bold text-white mt-0.5 font-mono">{item.quantity_tonnes.toFixed(1)} t</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">Quality</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">{item.quality_score_0_100.toFixed(0)}/100</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">Contam</p>
                      <p className="text-xs font-bold text-amber-400 mt-0.5 font-mono">{item.contamination_est_pct.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Condition: <strong className="text-slate-200">{item.condition}</strong></span>
                    <span>Sector: <strong className="text-slate-200">{item.source_sector}</strong></span>
                  </div>
                </div>

                {/* Footer Action & Price */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Indicative Price</span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      ₹{item.indicative_price_inr_per_kg.toFixed(2)} <span className="text-xs font-normal text-slate-400">/kg</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenExchange(item)}
                      disabled={!isAvailable}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isAvailable
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Lot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-400">
        <div>
          Showing page <span className="font-semibold text-white">{page}</span> of{' '}
          <span className="font-semibold text-white">{Math.ceil(total / pageSize) || 1}</span> ({total} total listings)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
            disabled={page * pageSize >= total}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Listing Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Industrial Waste Material">
        <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Material Name & Grade</label>
            <input
              type="text"
              required
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="e.g. Industrial PET Bottle Regrind Flakes"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Material Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Source Industry Sector</label>
              <select
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Textile">Textile</option>
                <option value="Construction">Construction</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Food processing">Food Processing</option>
                <option value="Plastics">Plastics & Polymers</option>
                <option value="Chemical">Chemical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Available Qty (tonnes)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quality (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={newQuality}
                onChange={(e) => setNewQuality(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contamination Est %</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={newContam}
                onChange={(e) => setNewContam(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Condition</label>
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="sorted_clean">Sorted Clean</option>
                <option value="clean_dry">Clean & Dry</option>
                <option value="dry_clean">Dry Clean</option>
                <option value="fresh_segregated">Fresh Segregated</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Indicative Price (₹/kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Industrial City</label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Moderation Policy Notice</span>
            </div>
            <p>
              Newly submitted industrial waste materials will remain in <strong>Under Review</strong> status until reviewed by the Administrator to guarantee technical safety and SDG 12 standards.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Exchange Modal */}
      <Modal 
        isOpen={isExchangeModalOpen} 
        onClose={() => setIsExchangeModalOpen(false)} 
        title={`Initiate Circular Exchange: ${selectedListing?.material_name || ''}`}
      >
        {selectedListing && (
          <form onSubmit={handleSubmitExchange} className="space-y-4 text-xs">
            {exchangeSuccess ? (
              <div className="py-8 text-center text-emerald-400 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <h4 className="text-base font-bold text-white">Exchange Request Submitted!</h4>
                <p className="text-slate-400 text-xs">Redirecting to Exchange Lifecycle Manager...</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supplier:</span>
                    <span className="font-semibold text-white">{selectedListing.supplier_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Lot Volume:</span>
                    <span className="font-semibold text-white font-mono">{selectedListing.quantity_tonnes} tonnes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indicative Ask Price:</span>
                    <span className="font-semibold text-emerald-400 font-mono">₹{selectedListing.indicative_price_inr_per_kg.toFixed(2)}/kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Required Quantity (tonnes)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max={selectedListing.quantity_tonnes}
                      required
                      value={requestQty}
                      onChange={(e) => setRequestQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Offered Price (₹/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Notes / Logistics Specifications</label>
                  <textarea
                    rows={3}
                    value={exchangeNotes}
                    onChange={(e) => setExchangeNotes(e.target.value)}
                    placeholder="Specify freight expectations, packaging preference (e.g. jumbo bags, baled), or delivery timeline."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExchangeModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={exchangeSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {exchangeSubmitting ? 'Transmitting...' : 'Send Request to Supplier'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};
