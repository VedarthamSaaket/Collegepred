'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface SavedCollege {
  id: string;
  collegeId: string;
  college: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    type: string;
    rating: number;
    totalFees: number;
  };
}

interface SavedComparison {
  id: string;
  name: string | null;
  collegeIds: string[];
  createdAt: string;
}

export default function SavedPage() {
  const { data: session } = useSession();
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch('/api/saved');
        if (res.ok) {
          const data = await res.json();
          setSavedColleges(data.savedColleges || data.colleges || []);
          setComparisons(data.comparisons || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  const handleRemove = async (collegeId: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });
      if (res.ok) {
        setSavedColleges((prev) => prev.filter((sc) => sc.collegeId !== collegeId));
      }
    } catch {
      // Silent fail
    }
  };

  const ratingCircles = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5]">
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-[#F5EDE4] rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-[#F5EDE4] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-[#3A2917] mb-8 font-semibold italic">Saved Items</h1>

        {savedColleges.length === 0 && comparisons.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-12 text-center shadow-sm">
            <p className="text-2xl text-[#8B653B] mb-3 font-semibold italic">Nothing saved yet</p>
            <p className="text-[#B8A080] mb-6">Save colleges to compare them later or keep track of your favourites.</p>
            <Link
              href="/colleges"
              className="bg-[#543D23] text-white px-6 py-2.5 rounded-lg text-sm font-semibold inline-block hover:bg-[#3A2917]"
            >
              Browse Colleges
            </Link>
          </div>
        ) : (
          <>
            {savedColleges.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">
                  Saved Colleges ({savedColleges.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedColleges.map((saved) => (
                    <div key={saved.id} className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-5 hover:border-[#543D23]/50 transition-all group shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-0.5 bg-[#543D23] text-white text-xs font-semibold rounded">
                          {saved.college.type}
                        </span>
                        <button
                          onClick={() => handleRemove(saved.collegeId)}
                          className="opacity-0 group-hover:opacity-100 text-[#B8A080] hover:text-red-500 transition-all"
                          aria-label="Remove from saved"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <Link href={`/colleges/${saved.college.slug}`}>
                        <h3 className="text-lg text-[#3A2917] mb-1 hover:text-[#543D23] font-semibold italic">
                          {saved.college.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8B653B] mb-3">
                        {saved.college.city}, {saved.college.state}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {ratingCircles(saved.college.rating).map((filled, i) => (
                            <span key={i} className={`w-2 h-2 rounded-full ${filled ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-[#3A2917]">
                          ₹{saved.college.totalFees.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {comparisons.length > 0 && (
              <section>
                <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">
                  Saved Comparisons ({comparisons.length})
                </h2>
                <div className="space-y-4">
                  {comparisons.map((comp) => (
                    <div key={comp.id} className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-5 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-lg text-[#3A2917] font-semibold italic">
                          {comp.name ?? `Comparison from ${new Date(comp.createdAt).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-[#B8A080] mt-1">
                          {comp.collegeIds.length} colleges
                        </p>
                      </div>
                      <Link
                        href={`/compare?ids=${comp.collegeIds.join(',')}`}
                        className="px-4 py-2 bg-[#543D23] text-white rounded-lg text-sm font-semibold hover:bg-[#3A2917] transition-colors"
                      >
                        View Comparison
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}