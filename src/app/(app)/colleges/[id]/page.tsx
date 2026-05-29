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
  courses: { id: string; name: string; duration: number; fees: number; seats: number | null }[];
  reviews: { id: string; author: string; rating: number; body: string; category: string; createdAt: string }[];
  cutoffs: { id: string; exam: string; category: string; rankMin: number; rankMax: number; year: number; branch: string | null }[];
}

export default function CollegeDetailPage() {
  const params = useParams();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/colleges" className="text-sm text-[#8B653B] hover:text-[#543D23] mb-6 inline-block font-semibold italic">
          &larr; Back to Colleges
        </Link>

        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded text-xs font-semibold italic bg-[#3A2917] text-white mb-3">
                {college.type}
              </span>
              <h1 className="text-4xl text-[#3A2917] mb-2 font-semibold italic">{college.name}</h1>
              <p className="text-[#8B653B] font-semibold italic">{college.city}, {college.state}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl text-[#3A2917] font-semibold italic">₹{college.totalFees.toLocaleString()}</p>
              <p className="text-xs text-[#B8A080] font-semibold italic">Total Fees</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {ratingCircles.map((filled, i) => (
                <span key={i} className={`w-3 h-3 rounded-full ${filled ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`} />
              ))}
              <span className="text-sm text-[#B8A080] ml-1 font-semibold italic">{college.rating.toFixed(1)}</span>
            </div>
            {college.naacGrade && (
              <span className="text-sm text-[#8B653B] font-semibold italic">NAAC: {college.naacGrade}</span>
            )}
            {college.nirfRank && (
              <span className="text-sm text-[#8B653B] font-semibold italic">NIRF Rank: #{college.nirfRank}</span>
            )}
            {college.established && (
              <span className="text-sm text-[#8B653B] font-semibold italic">Est. {college.established}</span>
            )}
          </div>

          {college.website && (
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#543D23] hover:underline font-semibold italic"
            >
              Visit website &rarr;
            </a>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Overview</h2>
          <p className="text-[#8B653B] leading-relaxed font-semibold italic">{college.overview}</p>
        </div>

        {college.courses.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Courses</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4B896]">
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Course</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Duration</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Fees</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {college.courses.map((course) => (
                    <tr key={course.id} className="border-b border-[#D4B896]">
                      <td className="py-3 text-[#3A2917] font-semibold italic">{course.name}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{course.duration} years</td>
                      <td className="py-3 text-[#3A2917] font-semibold italic">₹{course.fees.toLocaleString()}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{course.seats ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(college.placementAvg || college.placementMax || college.placementPct) && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Placements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {college.placementAvg && (
                <div className="text-center">
                  <p className="text-3xl text-[#543D23] font-semibold italic">₹{college.placementAvg.toLocaleString()}</p>
                  <p className="text-sm text-[#B8A080] font-semibold italic">Average Package</p>
                </div>
              )}
              {college.placementMax && (
                <div className="text-center">
                  <p className="text-3xl text-[#543D23] font-semibold italic">₹{college.placementMax.toLocaleString()}</p>
                  <p className="text-sm text-[#B8A080] font-semibold italic">Highest Package</p>
                </div>
              )}
              {college.placementPct && (
                <div className="text-center">
                  <p className="text-3xl text-[#543D23] font-semibold italic">{college.placementPct}%</p>
                  <p className="text-sm text-[#B8A080] font-semibold italic">Placement Rate</p>
                </div>
              )}
            </div>
            {college.topRecruiters.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-[#3A2917] mb-2 font-semibold italic">Top Recruiters</p>
                <div className="flex flex-wrap gap-2">
                  {college.topRecruiters.map((recruiter) => (
                    <span key={recruiter} className="px-3 py-1 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">
                      {recruiter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {college.cutoffs.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Cutoffs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4B896]">
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Exam</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Category</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Branch</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Rank Range</th>
                    <th className="text-left py-3 text-[#3A2917] font-semibold italic">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {college.cutoffs.map((cutoff) => (
                    <tr key={cutoff.id} className="border-b border-[#D4B896]">
                      <td className="py-3 text-[#3A2917] font-semibold italic">{cutoff.exam.replace('_', ' ')}</td>
                      <td className="py-3 text-[#3A2917] font-semibold italic">{cutoff.category}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{cutoff.branch ?? 'All'}</td>
                      <td className="py-3 text-[#3A2917] font-semibold italic">{cutoff.rankMin.toLocaleString()} - {cutoff.rankMax.toLocaleString()}</td>
                      <td className="py-3 text-[#8B653B] font-semibold italic">{cutoff.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {college.reviews.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">Reviews</h2>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <div key={review.id} className="border-b border-[#D4B896] pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[#3A2917] font-semibold italic">{review.author}</span>
                    <span className="text-xs text-[#B8A080] font-semibold italic">{new Date(review.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 bg-[#F5EDE4] rounded text-xs text-[#8B653B] font-semibold italic">{review.category}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${i < Math.round(review.rating) ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`} />
                    ))}
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
          </div>
        )}
      </div>
    </div>
  );
}