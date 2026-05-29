'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import CollegeCard from '@/components/college/CollegeCard';
import { useCompare } from '@/hooks/useCompare';
import { useSaved } from '@/hooks/useSaved';
import { useDebounce } from '@/hooks/useDebounce';
import CompareBar from '@/components/compare/CompareBar';

interface CollegeListItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  totalFees: number;
  imageUrl: string | null;
}

interface CollegesResponse {
  colleges: CollegeListItem[];
  total: number;
  page: number;
  limit: number;
}

const COLLEGE_TYPES = ['IIT', 'NIT', 'IIIT', 'DEEMED', 'STATE', 'PRIVATE'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra',
  'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'West Bengal', 'Delhi',
  'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
  'Kerala', 'Assam', 'Chhattisgarh', 'Jharkhand', 'Uttarakhand',
];

export default function CollegesPage() {
  const { data: session } = useSession();
  const [colleges, setColleges] = useState<CollegeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { compareSet, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { savedIds, toggleSave } = useSaved();

  const fetchColleges = useCallback(async (pageNum: number, append: boolean) => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedTypes.length) params.set('type', selectedTypes.join(','));
    if (selectedState) params.set('state', selectedState);
    if (feeRange[0] > 0) params.set('feeMin', feeRange[0].toString());
    if (feeRange[1] < 500000) params.set('feeMax', feeRange[1].toString());
    params.set('page', pageNum.toString());
    params.set('limit', '12');

    try {
      const res = await fetch(`/api/colleges?${params}`);
      const data: CollegesResponse = await res.json();
      const incoming = Array.isArray(data?.colleges) ? data.colleges : [];
      if (append) {
        setColleges((prev) => [...prev, ...incoming]);
      } else {
        setColleges(incoming);
      }
      setTotal(data?.total ?? 0);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, selectedTypes, selectedState, feeRange]);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    setColleges([]);
    fetchColleges(1, false);
  }, [fetchColleges]);

  useEffect(() => {
    if (!observerRef.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !loadingMore &&
          (colleges?.length ?? 0) < total
        ) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchColleges(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, colleges, total, page, fetchColleges]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTypes([]);
    setSelectedState('');
    setFeeRange([0, 500000]);
  };

  const activeFilterCount =
    (selectedTypes.length ? 1 : 0) +
    (selectedState ? 1 : 0) +
    (feeRange[0] > 0 || feeRange[1] < 500000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#3A2917] mb-1 font-semibold italic">
              Explore <span className="text-[#543D23]">Colleges</span>
            </h1>
            {total > 0 && !loading && (
              <p className="text-xs text-[#B8A080] uppercase tracking-widest mt-1 font-semibold italic">
                {total.toLocaleString()} institutions
              </p>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest cursor-pointer transition-all backdrop-blur-sm font-semibold italic ${
              showFilters
                ? 'bg-[#543D23]/15 border border-[#543D23]/40 text-[#3A2917]'
                : 'bg-white/80 border border-[#D4B896] text-[#8B653B] hover:border-[#543D23]/30'
            }`}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#543D23] text-white text-[8px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges by name, city, or type…"
            className="w-full max-w-lg px-4 py-2.5 bg-white/80 border border-[#D4B896] rounded-lg text-sm text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:border-[#543D23]/50 transition-colors font-semibold italic"
          />
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-7 mb-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* Type */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B8A080] mb-3 font-semibold italic">College Type</p>
              <div className="flex flex-wrap gap-2">
                {COLLEGE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider cursor-pointer transition-all font-semibold italic ${
                      selectedTypes.includes(type)
                        ? 'bg-[#543D23]/20 border border-[#543D23]/40 text-[#3A2917]'
                        : 'bg-white/60 border border-[#D4B896] text-[#8B653B] hover:border-[#543D23]/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B8A080] mb-3 font-semibold italic">State</p>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-[#D4B896] rounded-lg text-sm text-[#3A2917] focus:outline-none focus:border-[#543D23]/50 font-semibold italic"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Fee range */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#B8A080] mb-1 font-semibold italic">Fee Range</p>
              <p className="text-xs text-[#8B653B] mb-2 font-semibold italic">₹{feeRange[0].toLocaleString()} – ₹{feeRange[1].toLocaleString()}</p>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={10000}
                  value={feeRange[0]}
                  onChange={(e) => setFeeRange([parseInt(e.target.value), feeRange[1]])}
                  className="w-full accent-[#543D23]"
                />
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={10000}
                  value={feeRange[1]}
                  onChange={(e) => setFeeRange([feeRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[#543D23]"
                />
              </div>
            </div>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-widest cursor-pointer border border-[#D4B896] text-[#B8A080] hover:border-[#543D23]/40 hover:text-[#3A2917] transition-all font-semibold italic"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 border border-[#D4B896] rounded-xl p-6 animate-pulse">
                <div className="h-3 bg-[#D4B896] rounded w-2/5 mb-3" />
                <div className="h-5 bg-[#D4B896] rounded w-3/4 mb-2" />
                <div className="h-3.5 bg-[#D4B896] rounded w-1/2 mb-3" />
                <div className="h-3.5 bg-[#D4B896] rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-[#3A2917] mb-3 font-semibold italic">No colleges found</p>
            <p className="text-sm text-[#B8A080] mb-6 font-semibold italic">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest bg-[#543D23]/15 border border-[#543D23]/35 text-[#3A2917] hover:bg-[#543D23]/25 transition-all cursor-pointer font-semibold italic"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  id={college.id}
                  name={college.name}
                  slug={college.slug}
                  city={college.city}
                  state={college.state}
                  type={college.type}
                  rating={college.rating}
                  totalFees={college.totalFees}
                  isSaved={savedIds.has(college.id)}
                  isInCompare={isInCompare(college.id)}
                  onSaveToggle={() => toggleSave(college.id)}
                  onCompareToggle={() =>
                    isInCompare(college.id)
                      ? removeFromCompare(college.id)
                      : addToCompare(college.id)
                  }
                />
              ))}
            </div>

            <div ref={observerRef} className="h-12 mt-8">
              {loadingMore && (
                <p className="text-center text-xs uppercase tracking-widest text-[#B8A080] font-semibold italic">
                  Loading more…
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <CompareBar
        compareSet={compareSet}
        colleges={colleges}
        removeFromCompare={removeFromCompare}
      />
    </div>
  );
}