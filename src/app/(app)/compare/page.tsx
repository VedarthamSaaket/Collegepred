'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  const [colleges, setColleges] = useState<CompareCollege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      router.push('/colleges');
      return;
    }

    async function fetchColleges() {
      try {
        const res = await fetch(`/api/compare?ids=${ids.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setColleges(data.colleges || data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();
  }, [ids, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgba(250,245,235,0.6)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="animate-pulse">
            <div style={{ height: '32px', background: 'rgba(212,184,150,0.4)', borderRadius: '8px', width: '25%', marginBottom: '32px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: '384px', background: 'rgba(212,184,150,0.3)', borderRadius: '12px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (colleges.length < 2) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgba(250,245,235,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '1.5rem',
              color: '#8B653B',
              marginBottom: '16px',
            }}
          >
            Not enough colleges to compare
          </p>
          <Link
            href="/colleges"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#543D23',
              textDecoration: 'underline',
            }}
          >
            Back to colleges
          </Link>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Type', key: 'type' as const },
    { label: 'Rating', key: 'rating' as const, format: (v: number) => v.toFixed(1) },
    { label: 'Total Fees', key: 'totalFees' as const, format: (v: number) => `₹${v.toLocaleString()}` },
    { label: 'Location', key: 'location' as const, get: (c: CompareCollege) => `${c.city}, ${c.state}` },
    { label: 'NAAC Grade', key: 'naacGrade' as const },
    { label: 'NIRF Rank', key: 'nirfRank' as const, format: (v: number) => `#${v}` },
    { label: 'Avg Package', key: 'placementAvg' as const, format: (v: number) => `₹${v.toLocaleString()}` },
    { label: 'Highest Package', key: 'placementMax' as const, format: (v: number) => `₹${v.toLocaleString()}` },
    { label: 'Placement Rate', key: 'placementPct' as const, format: (v: number) => `${v}%` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(250,245,235,0.6)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <Link
          href="/colleges"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#8B653B',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '24px',
          }}
        >
          &larr; Back to Colleges
        </Link>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '2rem',
            color: '#3A2917',
            marginBottom: '32px',
          }}
        >
          Compare Colleges
        </h1>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '16px 24px 16px 0',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#B39274',
                    width: '160px',
                  }}
                >
                  Metric
                </th>
                {colleges.map((college) => (
                  <th key={college.id} style={{ textAlign: 'center', padding: '16px 16px' }}>
                    <Link
                      href={`/colleges/${college.slug}`}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontStyle: 'italic',
                        fontSize: '18px',
                        color: '#3A2917',
                        textDecoration: 'none',
                      }}
                    >
                      {college.name}
                    </Link>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontStyle: 'italic',
                        fontSize: '11px',
                        color: '#B39274',
                        marginTop: '4px',
                      }}
                    >
                      {college.city}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.key} style={{ borderTop: '1px solid rgba(212,184,150,0.5)' }}>
                  <td
                    style={{
                      padding: '16px 24px 16px 0',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      fontStyle: 'italic',
                      fontSize: '13px',
                      color: '#8B653B',
                    }}
                  >
                    {metric.label}
                  </td>
                  {colleges.map((college) => {
                    let value: unknown = college[metric.key as keyof CompareCollege];
                    if (metric.get) {
                      value = metric.get(college);
                    } else if (metric.format && value != null) {
                      value = metric.format(value as number);
                    }
                    return (
                      <td
                        key={college.id}
                        style={{
                          textAlign: 'center',
                          padding: '16px 16px',
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 600,
                          fontStyle: 'italic',
                          fontSize: '14px',
                          color: '#3A2917',
                        }}
                      >
                        {String(value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'rgba(250,245,235,0.6)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          <div className="animate-pulse" style={{ height: '32px', background: 'rgba(212,184,150,0.4)', borderRadius: '8px', width: '25%' }} />
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}