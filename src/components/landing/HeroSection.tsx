'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Search, GitCompare, BarChart3, MessageSquare, BookOpen, Shield, Languages, GraduationCap, ChevronDown, Star, MapPin, Users, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: Search,
    title: 'Intelligent College Search',
    desc: 'Full-text search across IITs, NITs, IIITs, and state colleges with intelligent filters by type, location, fees, and ratings. Find your perfect match in seconds.',
  },
  {
    icon: GitCompare,
    title: 'Side-by-Side Comparison',
    desc: 'Select up to 3 colleges and compare fees, placements, NIRF rankings, NAAC grades, and more. Make informed decisions with data at your fingertips.',
  },
  {
    icon: BarChart3,
    title: 'AI Rank Predictor',
    desc: 'Enter your JEE Mains, JEE Advanced, or EAMCET rank and instantly discover colleges where you have the best chance of admission based on historical cutoff data.',
  },
  {
    icon: MessageSquare,
    title: 'Community Q&A Forum',
    desc: 'Ask questions, share insights, and get answers from fellow engineering aspirants. Learn from real experiences and make confident choices.',
  },
  {
    icon: Shield,
    title: 'Verified Cutoff Data',
    desc: 'Access authentic, up-to-date cutoff ranks from official JOSAA, CSAB, and state counseling authorities. No outdated or unreliable information.',
  },
  {
    icon: Languages,
    title: 'Multilingual Support',
    desc: 'Hindi, Telugu, Kannada, and more. Breaking language barriers for every student.',
  },
];

const stats = [
  { label: 'Colleges Listed', value: '50+', icon: GraduationCap },
  { label: 'Courses Covered', value: '320+', icon: BookOpen },
  { label: 'Cutoff Entries', value: '1,080+', icon: BarChart3 },
  { label: 'Active Users', value: 'Growing', icon: Users },
];

const languages = [
  { code: 'en', name: 'English', phrase: 'Find Your Perfect College' },
  { code: 'hi', name: 'Hindi', phrase: 'Khojen Apna Aadarsh College' },
  { code: 'te', name: 'Telugu', phrase: 'Meeru Aadarsh College Ni Kanugonandi' },
  { code: 'kn', name: 'Kannada', phrase: 'Nimma Aadarsh College Annu Huduki' },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: i * 0.1 },
});

export function HeroSection() {
  const [activeLang, setActiveLang] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLang((prev) => (prev + 1) % languages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="no-select">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FFFDF5]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#F5EDE4] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="max-w-5xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#543D23]/10 backdrop-blur-sm border border-[#D4B896] mb-8"
            >
              <Zap className="w-4 h-4 text-[#543D23]" />
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '12px',
                  color: '#543D23',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                India's Smartest College Discovery Platform
              </span>
            </motion.div>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                color: '#3A2917',
                marginBottom: '24px',
                lineHeight: '1.05',
                letterSpacing: '-0.01em',
              }}
            >
              Discover Your
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #543D23, #8B653B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfect College
              </span>
            </h1>

            {/* Multilingual carousel */}
            <div style={{ height: '56px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {languages.map((lang, i) => (
                <motion.p
                  key={lang.code}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    color: '#8B653B',
                    position: 'absolute',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={activeLang === i ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {lang.phrase}
                </motion.p>
              ))}
            </div>

            {/* Language selector pills */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
              {languages.map((lang, i) => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(i)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    border: activeLang === i ? '1px solid #543D23' : '1px solid rgba(212,184,150,0.6)',
                    background: activeLang === i ? '#543D23' : 'rgba(245,237,228,0.6)',
                    color: activeLang === i ? '#fff' : '#543D23',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                color: '#8B653B',
                marginBottom: '40px',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6',
              }}
            >
              Search thousands of engineering colleges across India. Compare rankings, fees, placements.
              Predict your admission chances with real JEE & EAMCET cutoff data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '80px', flexWrap: 'wrap' }}>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  borderRadius: '10px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  background: '#543D23',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(84,61,35,0.2)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s, transform 0.2s',
                }}
              >
                Get Started Free
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  borderRadius: '10px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  background: 'rgba(245,237,228,0.8)',
                  color: '#543D23',
                  border: '1px solid rgba(212,184,150,0.5)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              maxWidth: '900px',
              width: '100%',
              margin: '0 auto',
              padding: '0 16px',
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  background: 'rgba(245,237,228,0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,184,150,0.4)',
                }}
              >
                <stat.icon style={{ width: '24px', height: '24px', color: '#543D23', margin: '0 auto 8px' }} />
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                    color: '#3A2917',
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#8B653B',
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown style={{ width: '24px', height: '24px', color: '#D4B896' }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-28 px-4 overflow-hidden bg-[#FFF8E7]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#F5EDE4] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '12px',
                color: '#8B653B',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Everything You Need
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#3A2917',
                marginTop: '16px',
                marginBottom: '16px',
              }}
            >
              Why CollegePathya?
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#8B653B',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Built for engineering aspirants who deserve transparent, accurate, and accessible college information.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger(i)}
                className="group cursor-default"
                style={{
                  padding: '32px',
                  background: 'rgba(245,237,228,0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,184,150,0.4)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(84,61,35,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <feature.icon style={{ width: '28px', height: '28px', color: '#543D23' }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: '#3A2917',
                    marginBottom: '12px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: '#8B653B',
                    lineHeight: '1.6',
                  }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-28 px-4 overflow-hidden bg-[#FFFDF5]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EDE4] via-[#FFF8E7] to-[#FFFDF5] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '12px',
                color: '#8B653B',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Simple Process
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#3A2917',
                marginTop: '16px',
                marginBottom: '16px',
              }}
            >
              How It Works
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#8B653B',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Three simple steps to find, compare, and choose your ideal college.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search & Filter',
                desc: 'Browse our database of 50+ top engineering colleges. Filter by exam, location, fees, and type to find what matters to you.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Compare & Predict',
                desc: 'Use our side-by-side comparison tool and AI-powered predictor. See your admission chances based on real historical cutoffs.',
                icon: BarChart3,
              },
              {
                step: '03',
                title: 'Decide with Confidence',
                desc: 'Read community reviews, ask questions, and save your shortlisted colleges. Make your decision backed by data.',
                icon: Star,
              },
            ].map((item, i) => (
              <motion.div key={item.step} {...stagger(i)} className="text-center">
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(84,61,35,0.1)',
                    border: '2px solid rgba(212,184,150,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      fontStyle: 'italic',
                      fontSize: '1.5rem',
                      color: '#543D23',
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'rgba(84,61,35,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <item.icon style={{ width: '28px', height: '28px', color: '#543D23' }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '1.5rem',
                    color: '#3A2917',
                    marginBottom: '12px',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '14px',
                    color: '#8B653B',
                    maxWidth: '280px',
                    margin: '0 auto',
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM SUPPORT SECTION */}
      <section className="relative py-28 px-4 overflow-hidden bg-[#FFF8E7]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7] to-[#F5EDE4] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '12px',
                color: '#8B653B',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Supported Exams
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#3A2917',
                marginTop: '16px',
                marginBottom: '16px',
              }}
            >
              Every Major Engineering Exam
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#8B653B',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Complete cutoff data for all major entrance exams, updated regularly from official sources.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { exam: 'JEE Mains', colleges: 'NITs, IIITs, GFTIs', desc: 'All India rank-based counseling data' },
              { exam: 'JEE Advanced', colleges: 'IITs & top-tier institutions', desc: 'IIT joint seat allocation data' },
              { exam: 'EAMCET (TS)', colleges: 'Telangana state colleges', desc: 'Telangana engineering admissions' },
              { exam: 'EAMCET (AP)', colleges: 'Andhra Pradesh colleges', desc: 'AP engineering counseling data' },
            ].map((item, i) => (
              <motion.div
                key={item.exam}
                {...stagger(i)}
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  background: 'rgba(245,237,228,0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,184,150,0.4)',
                }}
              >
                <GraduationCap style={{ width: '40px', height: '40px', color: '#543D23', margin: '0 auto 16px' }} />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: '#3A2917',
                    marginBottom: '8px',
                  }}
                >
                  {item.exam}
                </h3>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#543D23',
                    marginBottom: '8px',
                  }}
                >
                  {item.colleges}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#8B653B',
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-28 px-4 overflow-hidden bg-[#FFFDF5]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EDE4] via-[#FFF8E7] to-[#FFFDF5] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '12px',
                color: '#8B653B',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Start Your Journey
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: '#3A2917',
                marginTop: '24px',
                marginBottom: '16px',
              }}
            >
              Ready to Find Your
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #543D23, #8B653B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfect College?
              </span>
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: 'italic',
                fontSize: '1rem',
                color: '#8B653B',
                maxWidth: '500px',
                margin: '0 auto 40px',
              }}
            >
              Join thousands of students who have found their ideal colleges using CollegePathya.
              Free to start, no credit card required.
            </p>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  borderRadius: '10px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  background: '#543D23',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(84,61,35,0.2)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s, transform 0.2s',
                }}
              >
                Create Free Account
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </Link>
              <Link
                href="/colleges"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 40px',
                  borderRadius: '10px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  background: 'rgba(245,237,228,0.8)',
                  color: '#543D23',
                  border: '1px solid rgba(212,184,150,0.5)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Browse as Guest
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: '#3A2917',
          color: '#D4B896',
          padding: '48px 16px',
          borderTop: '1px solid rgba(212,184,150,0.15)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BookOpen style={{ width: '24px', height: '24px', color: '#D4B896' }} />
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: '#FFFDF5',
                  }}
                >
                  CollegePathya
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: '#B39274',
                  lineHeight: '1.6',
                }}
              >
                Empowering students to make informed college decisions with transparent data and community insights.
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: '#FFFDF5',
                  marginBottom: '12px',
                }}
              >
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <Link href="/colleges" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896', textDecoration: 'none' }}>
                    Colleges
                  </Link>
                </li>
                <li>
                  <Link href="/predictor" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896', textDecoration: 'none' }}>
                    Predictor
                  </Link>
                </li>
                <li>
                  <Link href="/discuss" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896', textDecoration: 'none' }}>
                    Q&A Forum
                  </Link>
                </li>
                <li>
                  <Link href="/compare" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896', textDecoration: 'none' }}>
                    Compare
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: '#FFFDF5',
                  marginBottom: '12px',
                }}
              >
                Exams
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>JEE Mains</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>JEE Advanced</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>EAMCET (TS)</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>EAMCET (AP)</li>
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: '#FFFDF5',
                  marginBottom: '12px',
                }}
              >
                Languages
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>English</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>Hindi</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>Telugu</li>
                <li style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '13px', color: '#D4B896' }}>Kannada</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(84,61,35,0.8)', paddingTop: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '11px', color: '#B39274', margin: 0 }}>
              &copy; {new Date().getFullYear()} CollegePathya. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontStyle: 'italic', fontSize: '11px', color: '#B39274' }}>
                Made for every Indian student
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}