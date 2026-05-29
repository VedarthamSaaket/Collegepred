'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CompareCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  totalFees: number;
  naacGrade: string | null;
  nirfRank: number | null;
  placementAvg: number | null;
  placementMax: number | null;
  placementPct: number | null;
  established: number | null;
  campusArea: string | null;
  totalStudents: number | null;
  facultyStudentRatio: string | null;
  hostelAvailable: boolean;
  hostelCompulsory: boolean;
  hostelFeesPerYear: number | null;
  messFees: number | null;
  transportFees: number | null;
  tuitionFees: number | null;
  accreditations: string[];
}

type MetricKey = keyof CompareCollege;

interface Metric {
  label: string;
  section: string;
  render: (c: CompareCollege) => string;
  highlight?: boolean; // lower is better (fees), higher is better (rating)
  higherBetter?: boolean;
}

const metrics: Metric[] = [
  // Basics
  { label: 'Type', section: 'General', render: (c) => c.type },
  { label: 'Location', section: 'General', render: (c) => `${c.city}, ${c.state}` },
  { label: 'Established', section: 'General', render: (c) => c.established ? String(c.established) : '—' },
  { label: 'NAAC Grade', section: 'General', render: (c) => c.naacGrade ?? '—' },
  { label: 'NIRF Rank', section: 'General', render: (c) => c.nirfRank ? `#${c.nirfRank}` : '—', highlight: true, higherBetter: false },
  { label: 'Rating', section: 'General', render: (c) => `${c.rating.toFixed(1)} / 5`, highlight: true, higherBetter: true },
  { label: 'Campus Area', section: 'General', render: (c) => c.campusArea ?? '—' },
  { label: 'Total Students', section: 'General', render: (c) => c.totalStudents ? c.totalStudents.toLocaleString() : '—' },
  { label: 'Faculty Ratio', section: 'General', render: (c) => c.facultyStudentRatio ?? '—' },
  { label: 'Accreditations', section: 'General', render: (c) => c.accreditations.length > 0 ? c.accreditations.join(', ') : '—' },
  // Fees
  { label: 'Total Fees (4yr)', section: 'Fees', render: (c) => `₹${c.totalFees.toLocaleString()}`, highlight: true, higherBetter: false },
  { label: 'Tuition / yr', section: 'Fees', render: (c) => c.tuitionFees ? `₹${c.tuitionFees.toLocaleString()}` : '—' },
  // Hostel
  { label: 'Hostel Available', section: 'Hostel', render: (c) => c.hostelAvailable ? 'Yes' : 'No' },
  { label: 'Hostel Compulsory', section: 'Hostel', render: (c) => c.hostelCompulsory ? 'Yes (1st yr)' : 'No' },
  { label: 'Hostel Fees / yr', section: 'Hostel', render: (c) => c.hostelFeesPerYear ? `₹${c.hostelFeesPerYear.toLocaleString()}` : '—', highlight: true, higherBetter: false },
  { label: 'Mess Fees / yr', section: 'Hostel', render: (c) => c.messFees ? `₹${c.messFees.toLocaleString()}` : '—' },
  // Placements
  { label: 'Avg Package', section: 'Placements', render: (c) => c.placementAvg ? `₹${(c.placementAvg / 100000).toFixed(1)}L` : '—', highlight: true, higherBetter: true },
  { label: 'Highest Package', section: 'Placements', render: (c) => c.placementMax ? `₹${(c.placementMax / 100000).toFixed(0)}L` : '—', highlight: true, higherBetter: true },
  { label: 'Placement Rate', section: 'Placements', render: (c) => c.placementPct ? `${c.placementPct}%` : '—', highlight: true, higherBetter: true },
];

function getBestIndex(section: Metric, colleges: CompareCollege[]): number | null {
  if (!section.highlight) return null;
  const values = colleges.map((c) => {
    const raw = section.render(c);
    if (raw === '—') return null;
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  });
  if (values.every((v) => v === null)) return null;
  let bestIdx = -1;
  let bestVal = section.higherBetter ? -Infinity : Infinity;
  values.forEach((v, i) => {
    if (v === null) return;
    if (section.higherBetter ? v > bestVal : v < bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  });
  return bestIdx >= 0 ? bestIdx : null;
}

const sections = ['General', 'Fees', 'Hostel', 'Placements'];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [colleges, setColleges] = useState<CompareCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('General');

  const { data: session } = useSession();
  const savedRef = useRef(false);

  useEffect(() => {
    if (ids.length < 2) {
      router.push('/colleges');
      return;
    }

    async function fetchColleges() {
      try {
        const res = await fetch(`/api/compare?ids=${ids.join(',')}`);
        if (res.ok) {
          const json = await res.json();
          // API returns { data: [...] }
          setColleges(json.data || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();

    // Auto-save comparison to DB when user views this page
    if (session?.user && !savedRef.current) {
      savedRef.current = true;
      fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeIds: ids }),
      }).catch(() => {}); // Silent fail
    }
  }, [ids.join(','), session?.user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5]">
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-[#D4B896] rounded w-1/4 mb-8" />
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 bg-[#D4B896] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (colleges.length < 2) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-[#8B653B] mb-4 font-semibold italic">Not enough colleges to compare</p>
          <Link href="/colleges" className="text-[#543D23] hover:underline font-semibold italic">Back to colleges</Link>
        </div>
      </div>
    );
  }

  const filteredMetrics = metrics.filter((m) => m.section === activeSection);

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/colleges"
          className="text-sm text-[#8B653B] hover:text-[#543D23] mb-6 inline-block font-semibold italic"
        >
          &larr; Back to Colleges
        </Link>

        <h1 className="text-3xl sm:text-4xl text-[#3A2917] mb-6 font-semibold italic">
          Compare Colleges
        </h1>

        {/* College name headers */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 mb-4 shadow-sm">
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}>
            <div />
            {colleges.map((college) => (
              <div key={college.id} className="text-center">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold italic bg-[#3A2917] text-white mb-2">
                  {college.type}
                </span>
                <Link
                  href={`/colleges/${college.slug}`}
                  className="block text-lg text-[#3A2917] hover:text-[#543D23] font-semibold italic leading-tight"
                >
                  {college.name}
                </Link>
                <p className="text-xs text-[#B8A080] font-semibold italic mt-1">{college.city}, {college.state}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-4 bg-white/80 border border-[#D4B896] rounded-xl p-1.5 shadow-sm w-fit">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold italic uppercase tracking-wider transition-all ${
                activeSection === sec
                  ? 'bg-[#3A2917] text-white'
                  : 'text-[#8B653B] hover:bg-[#F5EDE4]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Metrics table */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '600px' }}>
              <tbody>
                {filteredMetrics.map((metric, idx) => {
                  const bestIdx = getBestIndex(metric, colleges);
                  return (
                    <tr
                      key={metric.label}
                      className={`border-b border-[#D4B896]/40 ${idx % 2 === 0 ? '' : 'bg-[#F5EDE4]/20'}`}
                    >
                      <td
                        className="py-3 px-6 font-semibold italic text-[#8B653B] text-xs uppercase tracking-wider"
                        style={{ width: '200px', minWidth: '160px' }}
                      >
                        {metric.label}
                      </td>
                      {colleges.map((college, ci) => {
                        const val = metric.render(college);
                        const isBest = bestIdx === ci;
                        return (
                          <td
                            key={college.id}
                            className={`py-3 px-4 text-center font-semibold italic ${
                              isBest
                                ? 'text-[#2d6a1e] bg-green-50'
                                : 'text-[#3A2917]'
                            }`}
                          >
                            {isBest && val !== '—' && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 align-middle" />
                            )}
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#B8A080] mt-4 font-semibold italic">
          ● Green highlighted cells indicate the best value in that row.
        </p>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <p className="text-[#B8A080] font-semibold italic">Loading comparison…</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}