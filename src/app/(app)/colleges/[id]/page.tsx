'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CollegeDetail {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  totalFees: number;
  overview: string;
  established: number | null;
  website: string | null;
  logoUrl: string | null;
  naacGrade: string | null;
  nirfRank: number | null;
  placementAvg: number | null;
  placementMax: number | null;
  placementPct: number | null;
  topRecruiters: string[];

  // Hostel & accommodation
  hostelAvailable: boolean;
  hostelCompulsory: boolean;
  hostelFeesPerYear: number | null;
  accommodationTypes: string[];
  transportFees: number | null;
  messFees: number | null;

  // Fee breakdown
  tuitionFees: number | null;
  examFees: number | null;
  otherFees: number | null;

  // Extra
  accreditations: string[];
  campusArea: string | null;
  totalStudents: number | null;
  facultyStudentRatio: string | null;
  libraryBooks: number | null;
  researchPapers: number | null;

  courses: { id: string; name: string; duration: number; fees: number; seats: number | null }[];
  reviews: { id: string; author: string; rating: number; body: string; category: string; createdAt: string }[];
  cutoffs: { id: string; exam: string; category: string; rankMin: number; rankMax: number; year: number; branch: string | null }[];
}

export default function CollegeDetailPage() {
  const params = useParams();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'fees' | 'placements' | 'cutoffs' | 'reviews'>('overview');
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    async function fetchCollege() {
      try {
        const res = await fetch(`/api/colleges/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCollege(data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchCollege();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5]">
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-[#D4B896] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[#D4B896] rounded w-1/2 mb-8" />
          <div className="h-64 bg-[#D4B896] rounded mb-6" />
          <div className="h-48 bg-[#D4B896] rounded mb-6" />
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl text-[#8B653B] mb-4 font-semibold italic">College not found</p>
          <Link href="/colleges" className="text-[#543D23] hover:underline font-semibold italic">Back to colleges</Link>
        </div>
      </div>
    );
  }

  const ratingCircles = Array.from({ length: 5 }, (_, i) => i < Math.round(college.rating));
  const paginatedReviews = college.reviews.slice(0, reviewPage * reviewsPerPage);
  const hasMoreReviews = reviewPage * reviewsPerPage < college.reviews.length;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'Courses' },
    { key: 'fees', label: 'Fees & Hostel' },
    { key: 'placements', label: 'Placements' },
    { key: 'cutoffs', label: 'Cutoffs' },
    { key: 'reviews', label: `Reviews (${college.reviews.length})` },
  ] as const;

  // Build total fee components for breakdown
  const feeBreakdown = [
    { label: 'Tuition Fees', value: college.tuitionFees, per: 'year' },
    { label: 'Hostel Fees', value: college.hostelFeesPerYear, per: 'year' },
    { label: 'Mess / Food', value: college.messFees, per: 'year' },
    { label: 'Transport', value: college.transportFees, per: 'year' },
    { label: 'Exam Fees', value: college.examFees, per: 'year' },
    { label: 'Other Fees', value: college.otherFees, per: 'year' },
  ].filter((f) => f.value != null);

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/colleges" className="text-sm text-[#8B653B] hover:text-[#543D23] mb-6 inline-block font-semibold italic">
          &larr; Back to Colleges
        </Link>

        {/* Header card */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block px-3 py-1 rounded text-xs font-semibold italic bg-[#3A2917] text-white">
                  {college.type}
                </span>
                {college.naacGrade && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold italic bg-[#543D23]/10 text-[#543D23]">
                    NAAC {college.naacGrade}
                  </span>
                )}
                {college.nirfRank && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold italic bg-[#543D23]/10 text-[#543D23]">
                    NIRF #{college.nirfRank}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl text-[#3A2917] mb-1 font-semibold italic">{college.name}</h1>
              <p className="text-[#8B653B] font-semibold italic">{college.city}, {college.state}</p>
              {college.established && (
                <p className="text-xs text-[#B8A080] mt-1 font-semibold italic">Est. {college.established}</p>
              )}
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl text-[#3A2917] font-semibold italic">₹{college.totalFees.toLocaleString()}</p>
              <p className="text-xs text-[#B8A080] font-semibold italic">Total Fees (4 yr)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {ratingCircles.map((filled, i) => (
                <span key={i} className={`w-3 h-3 rounded-full ${filled ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`} />
              ))}
              <span className="text-sm text-[#B8A080] ml-1 font-semibold italic">{college.rating.toFixed(1)}</span>
            </div>
            {college.campusArea && (
              <span className="text-xs text-[#8B653B] font-semibold italic">📍 {college.campusArea} campus</span>
            )}
            {college.totalStudents && (
              <span className="text-xs text-[#8B653B] font-semibold italic">👥 {college.totalStudents.toLocaleString()} students</span>
            )}
            {college.facultyStudentRatio && (
              <span className="text-xs text-[#8B653B] font-semibold italic">Faculty ratio {college.facultyStudentRatio}</span>
            )}
          </div>

          {/* Accreditations */}
          {college.accreditations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {college.accreditations.map((acc) => (
                <span key={acc} className="px-2 py-0.5 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">
                  {acc}
                </span>
              ))}
            </div>
          )}

          {college.website && (
            <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#543D23] hover:underline font-semibold italic">
              Visit website &rarr;
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 bg-white/80 border border-[#D4B896] rounded-xl p-1.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold italic uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? 'bg-[#3A2917] text-white'
                  : 'text-[#8B653B] hover:bg-[#F5EDE4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">About</h2>
              <p className="text-[#8B653B] leading-relaxed font-semibold italic">{college.overview}</p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Fees', value: `₹${college.totalFees.toLocaleString()}`, sub: '4-year total' },
                { label: 'Hostel', value: college.hostelAvailable ? (college.hostelFeesPerYear ? `₹${college.hostelFeesPerYear.toLocaleString()}/yr` : 'Available') : 'N/A', sub: college.hostelCompulsory ? 'Compulsory' : 'Optional' },
                { label: 'NIRF Rank', value: college.nirfRank ? `#${college.nirfRank}` : '—', sub: '2024' },
                { label: 'Avg Package', value: college.placementAvg ? `₹${(college.placementAvg / 100000).toFixed(1)}L` : '—', sub: 'per annum' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/80 border border-[#D4B896] rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl text-[#3A2917] font-semibold italic">{stat.value}</p>
                  <p className="text-xs text-[#3A2917] font-semibold italic mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-[#B8A080] font-semibold italic">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Research */}
            {(college.libraryBooks || college.researchPapers) && (
              <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg text-[#3A2917] mb-3 font-semibold italic">Research & Infrastructure</h3>
                <div className="flex flex-wrap gap-6">
                  {college.libraryBooks && (
                    <div>
                      <p className="text-xl text-[#543D23] font-semibold italic">{college.libraryBooks.toLocaleString()}</p>
                      <p className="text-xs text-[#B8A080] font-semibold italic">Library books</p>
                    </div>
                  )}
                  {college.researchPapers && (
                    <div>
                      <p className="text-xl text-[#543D23] font-semibold italic">{college.researchPapers.toLocaleString()}+</p>
                      <p className="text-xs text-[#B8A080] font-semibold italic">Annual research papers</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Courses ── */}
        {activeTab === 'courses' && college.courses.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Courses Offered</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4B896]">
                    {['Course', 'Duration', 'Fees / yr', 'Seats'].map((h) => (
                      <th key={h} className="text-left py-3 text-[#3A2917] font-semibold italic">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {college.courses.map((course) => (
                    <tr key={course.id} className="border-b border-[#D4B896]/50 hover:bg-[#F5EDE4]/30">
                      <td className="py-3 text-[#3A2917] font-semibold italic">{course.name}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{course.duration} yrs</td>
                      <td className="py-3 text-[#3A2917] font-semibold italic">₹{(course.fees / course.duration).toLocaleString()}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{course.seats ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Fees & Hostel ── */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Fee breakdown */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl text-[#3A2917] mb-6 font-semibold italic">Fee Breakdown</h2>

              {feeBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {feeBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#D4B896]/50">
                      <span className="text-[#8B653B] font-semibold italic text-sm">{item.label}</span>
                      <span className="text-[#3A2917] font-semibold italic">₹{item.value!.toLocaleString()} / {item.per}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[#3A2917] font-semibold italic">Total (4 years)</span>
                    <span className="text-xl text-[#543D23] font-semibold italic">₹{college.totalFees.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between py-3 border-b border-[#D4B896]/50">
                  <span className="text-[#8B653B] font-semibold italic text-sm">Total Programme Fees</span>
                  <span className="text-[#3A2917] font-semibold italic">₹{college.totalFees.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Hostel info */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Hostel & Accommodation</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-1 font-semibold italic">Hostel Available</p>
                  <p className="text-lg text-[#3A2917] font-semibold italic">
                    {college.hostelAvailable ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-1 font-semibold italic">Hostel Policy</p>
                  <p className="text-lg text-[#3A2917] font-semibold italic">
                    {college.hostelCompulsory ? 'Compulsory (1st year)' : 'Optional'}
                  </p>
                </div>
                {college.hostelFeesPerYear && (
                  <div>
                    <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-1 font-semibold italic">Hostel Fees</p>
                    <p className="text-lg text-[#3A2917] font-semibold italic">₹{college.hostelFeesPerYear.toLocaleString()} / year</p>
                  </div>
                )}
                {college.messFees && (
                  <div>
                    <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-1 font-semibold italic">Mess / Food Fees</p>
                    <p className="text-lg text-[#3A2917] font-semibold italic">₹{college.messFees.toLocaleString()} / year</p>
                  </div>
                )}
                {college.transportFees && (
                  <div>
                    <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-1 font-semibold italic">Transport Fees</p>
                    <p className="text-lg text-[#3A2917] font-semibold italic">₹{college.transportFees.toLocaleString()} / year</p>
                  </div>
                )}
              </div>

              {college.accommodationTypes.length > 0 && (
                <div>
                  <p className="text-xs text-[#B8A080] uppercase tracking-widest mb-2 font-semibold italic">Room Types</p>
                  <div className="flex flex-wrap gap-2">
                    {college.accommodationTypes.map((t) => (
                      <span key={t} className="px-3 py-1 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {!college.hostelAvailable && (
                <p className="text-sm text-[#B8A080] font-semibold italic mt-4">
                  This college does not have on-campus hostel facilities. Students typically arrange private accommodation nearby.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Placements ── */}
        {activeTab === 'placements' && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-6 font-semibold italic">Placement Statistics</h2>

            {(college.placementAvg || college.placementMax || college.placementPct) ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {college.placementAvg && (
                    <div className="text-center p-4 bg-[#F5EDE4] rounded-xl">
                      <p className="text-3xl text-[#543D23] font-semibold italic">₹{(college.placementAvg / 100000).toFixed(1)}L</p>
                      <p className="text-sm text-[#B8A080] font-semibold italic mt-1">Average Package</p>
                    </div>
                  )}
                  {college.placementMax && (
                    <div className="text-center p-4 bg-[#F5EDE4] rounded-xl">
                      <p className="text-3xl text-[#543D23] font-semibold italic">₹{(college.placementMax / 100000).toFixed(0)}L</p>
                      <p className="text-sm text-[#B8A080] font-semibold italic mt-1">Highest Package</p>
                    </div>
                  )}
                  {college.placementPct && (
                    <div className="text-center p-4 bg-[#F5EDE4] rounded-xl">
                      <p className="text-3xl text-[#543D23] font-semibold italic">{college.placementPct}%</p>
                      <p className="text-sm text-[#B8A080] font-semibold italic mt-1">Placement Rate</p>
                    </div>
                  )}
                </div>

                {college.topRecruiters.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-[#3A2917] mb-3 font-semibold italic">Top Recruiters</p>
                    <div className="flex flex-wrap gap-2">
                      {college.topRecruiters.map((r) => (
                        <span key={r} className="px-3 py-1 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#B8A080] font-semibold italic">Placement data not available yet.</p>
            )}
          </div>
        )}

        {/* ── Cutoffs ── */}
        {activeTab === 'cutoffs' && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Admission Cutoffs (2024)</h2>

            {college.cutoffs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D4B896]">
                      {['Exam', 'Category', 'Branch', 'Opening Rank', 'Closing Rank'].map((h) => (
                        <th key={h} className="text-left py-3 text-[#3A2917] font-semibold italic whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {college.cutoffs.map((cutoff) => (
                      <tr key={cutoff.id} className="border-b border-[#D4B896]/40 hover:bg-[#F5EDE4]/30">
                        <td className="py-3 text-[#3A2917] font-semibold italic whitespace-nowrap">{cutoff.exam.replace(/_/g, ' ')}</td>
                        <td className="py-3 text-[#8B653B] font-semibold italic">{cutoff.category}</td>
                        <td className="py-3 text-[#8B653B] font-semibold italic max-w-[200px] truncate" title={cutoff.branch ?? 'All'}>{cutoff.branch ?? 'All'}</td>
                        <td className="py-3 text-[#3A2917] font-semibold italic">{cutoff.rankMin.toLocaleString()}</td>
                        <td className="py-3 text-[#3A2917] font-semibold italic">{cutoff.rankMax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#B8A080] font-semibold italic">No cutoff data available for this college.</p>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        {activeTab === 'reviews' && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Student Reviews</h2>

            {college.reviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedReviews.map((review) => (
                    <div key={review.id} className="border-b border-[#D4B896] pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-[#3A2917] font-semibold italic">{review.author}</span>
                        <span className="text-xs text-[#B8A080] font-semibold italic">{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">{review.category}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`w-2 h-2 rounded-full ${i < Math.round(review.rating) ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`} />
                        ))}
                        <span className="text-xs text-[#B8A080] ml-1 font-semibold italic">{review.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-[#8B653B] leading-relaxed font-semibold italic">{review.body}</p>
                    </div>
                  ))}
                </div>
                {hasMoreReviews && (
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    className="mt-4 text-[#543D23] text-sm hover:underline font-semibold italic"
                  >
                    Show more reviews
                  </button>
                )}
              </>
            ) : (
              <p className="text-[#B8A080] font-semibold italic">No reviews yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}