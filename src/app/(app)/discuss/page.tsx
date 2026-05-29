'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const TAG_OPTIONS = ['JEE', 'EAMCET', 'Placements', 'Hostel', 'Fees', 'Admissions', 'Scholarships', 'Other'];

interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  answers: { id: string }[];
  views: number;
  user: { name: string | null };
  createdAt: string;
}

export default function DiscussPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');
  const [askTags, setAskTags] = useState<string[]>([]);
  const [askError, setAskError] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (selectedTag) params.set('tag', selectedTag);
      try {
        const res = await fetch(`/api/discuss?${params}`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.questions || data.data || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [search, selectedTag]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAskError('');

    if (askTitle.length < 10) {
      setAskError('Title must be at least 10 characters');
      return;
    }
    if (askBody.length < 20) {
      setAskError('Body must be at least 20 characters');
      return;
    }

    try {
      const res = await fetch('/api/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: askTitle, body: askBody, tags: askTags }),
      });
      if (res.ok) {
        const question = await res.json();
        setQuestions((prev) => [question, ...prev]);
        setShowAskModal(false);
        setAskTitle('');
        setAskBody('');
        setAskTags([]);
      } else {
        const data = await res.json();
        setAskError(data.error || 'Failed to post question');
      }
    } catch {
      setAskError('Failed to connect');
    }
  };

  const toggleTag = (tag: string) => {
    setAskTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl text-[#3A2917] font-semibold italic">Q&A Discussion</h1>
          <button
            onClick={() => setShowAskModal(true)}
            className="bg-[#543D23] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3A2917] transition-colors"
          >
            Ask a Question
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full max-w-xl px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              !selectedTag ? 'bg-[#543D23] text-white' : 'bg-white/80 border border-[#D4B896] text-[#3A2917]'
            }`}
          >
            All
          </button>
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                selectedTag === tag ? 'bg-[#543D23] text-white' : 'bg-white/80 border border-[#D4B896] text-[#3A2917]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 animate-pulse shadow-sm">
                <div className="h-5 bg-[#F5EDE4] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#F5EDE4] rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 text-center shadow-sm">
            <p className="text-xl text-[#8B653B] mb-2 font-semibold italic">No questions yet</p>
            <p className="text-[#B8A080] mb-4">Be the first to ask a question</p>
            <button
              onClick={() => setShowAskModal(true)}
              className="bg-[#543D23] text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
            >
              Ask a Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Link key={question.id} href={`/discuss/${question.id}`}>
                <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 hover:border-[#543D23]/50 transition-colors cursor-pointer shadow-sm">
                  <h3 className="text-xl text-[#3A2917] mb-2 font-semibold italic">{question.title}</h3>
                  <p className="text-sm text-[#8B653B] mb-3 line-clamp-2">{question.body}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {question.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[#F5EDE4] rounded text-xs text-[#8B653B]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-[#B8A080]">{question.answers.length} answers</span>
                    <span className="text-xs text-[#B8A080]">{question.views} views</span>
                    <span className="text-xs text-[#B8A080]">{timeAgo(question.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/95 backdrop-blur-sm border border-[#D4B896] rounded-xl w-full max-w-lg mx-4 p-8 shadow-lg">
            <h2 className="text-2xl text-[#3A2917] mb-6 font-semibold italic">Ask a Question</h2>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Title</label>
                <input
                  type="text"
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Body</label>
                <textarea
                  value={askBody}
                  onChange={(e) => setAskBody(e.target.value)}
                  placeholder="Provide more details..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3A2917] mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        askTags.includes(tag) ? 'bg-[#543D23] text-white' : 'bg-white border border-[#D4B896] text-[#3A2917]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {askError && <p className="text-sm text-red-600">{askError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#543D23] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3A2917]"
                >
                  Post Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="bg-white border border-[#D4B896] text-[#3A2917] px-6 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}