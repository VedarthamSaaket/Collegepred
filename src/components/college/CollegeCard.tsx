'use client';

import Link from 'next/link';

interface CollegeCardProps {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  rating: number;
  totalFees: number;
  isSaved: boolean;
  isInCompare: boolean;
  onSaveToggle: () => void;
  onCompareToggle: () => void;
}

const typeColors: Record<string, string> = {
  IIT: 'bg-[#3A2917] text-white',
  NIT: 'bg-[#543D23] text-white',
  IIIT: 'bg-[#8B653B] text-white',
  DEEMED: 'bg-[#D4B896] text-[#3A2917]',
  STATE: 'bg-[#D4B896] text-[#3A2917]',
  PRIVATE: 'bg-[#D4B896] text-[#3A2917]',
};

export default function CollegeCard({
  id,
  name,
  slug,
  city,
  state,
  type,
  rating,
  totalFees,
  isSaved,
  isInCompare,
  onSaveToggle,
  onCompareToggle,
}: CollegeCardProps) {
  const ratingCircles = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-5 hover:border-[#543D23]/50 transition-all shadow-sm">
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            onSaveToggle();
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isSaved ? 'text-[#543D23]' : 'text-[#B8A080] hover:text-[#543D23]'
          }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save college'}
        >
          <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            onCompareToggle();
          }}
          className={`p-1.5 rounded-full transition-colors text-xs font-semibold italic ${
            isInCompare ? 'text-[#543D23]' : 'text-[#B8A080] hover:text-[#543D23]'
          }`}
          aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      <Link href={`/colleges/${slug}`}>
        <div className="mb-3">
          <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold italic ${typeColors[type] || 'bg-[#D4B896] text-[#3A2917]'}`}>
            {type}
          </span>
        </div>
        <h3 className="text-xl text-[#3A2917] mb-1 pr-16 font-semibold italic">{name}</h3>
        <p className="text-sm text-[#8B653B] mb-3 font-semibold italic">{city}, {state}</p>

        <div className="flex items-center gap-1 mb-3">
          {ratingCircles.map((filled, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${filled ? 'bg-[#543D23]' : 'bg-[#D4B896]'}`}
            />
          ))}
          <span className="text-xs text-[#B8A080] ml-1 font-semibold italic">{rating.toFixed(1)}</span>
        </div>

        <p className="text-sm text-[#3A2917] font-semibold italic">
          Fees: <span className="font-semibold">₹{totalFees.toLocaleString()}</span>
        </p>
      </Link>
    </div>
  );
}