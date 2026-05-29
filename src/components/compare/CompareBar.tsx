'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface CompareBarProps {
  compareSet: string[];
  colleges: { id: string; name: string; slug: string }[];
  removeFromCompare: (id: string) => void;
}

export default function CompareBar({ compareSet, colleges, removeFromCompare }: CompareBarProps) {
  const router = useRouter();

  if (compareSet.length === 0) return null;

  const selectedColleges = colleges.filter((c) => compareSet.includes(c.id));

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(140,100,40,0.2)',
        padding: '12px 24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AnimatePresence>
            {selectedColleges.map((college) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(245,237,228,0.8)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(140,100,40,0.12)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: '#3A2917',
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {college.name}
                </span>
                <button
                  onClick={() => removeFromCompare(college.id)}
                  style={{
                    color: '#B39274',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3A2917')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#B39274')}
                  aria-label={`Remove ${college.name} from compare`}
                >
                  <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {compareSet.length > 0 && (
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '11px',
                color: '#B39274',
              }}
            >
              {compareSet.length}/3 selected
            </span>
          )}
        </div>

        <button
          onClick={() => router.push(`/compare?ids=${compareSet.join(',')}`)}
          disabled={compareSet.length < 2}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontStyle: 'italic',
            fontSize: '14px',
            letterSpacing: '0.04em',
            border: '1px solid rgba(140,100,40,0.2)',
            cursor: compareSet.length >= 2 ? 'pointer' : 'not-allowed',
            background: compareSet.length >= 2 ? '#543D23' : 'rgba(212,184,150,0.4)',
            color: compareSet.length >= 2 ? '#fff' : '#B39274',
            transition: 'background 0.2s',
            opacity: compareSet.length >= 2 ? 1 : 0.6,
          }}
          onMouseEnter={(e) => {
            if (compareSet.length >= 2) {
              e.currentTarget.style.background = '#3A2917';
            }
          }}
          onMouseLeave={(e) => {
            if (compareSet.length >= 2) {
              e.currentTarget.style.background = '#543D23';
            }
          }}
        >
          Compare Now
        </button>
      </div>
    </motion.div>
  );
}