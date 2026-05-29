'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Answer {
  id: string;
  body: string;
  accepted: boolean;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface QuestionDetail {
  id: string;
  title: string;
  body: string;
  tags: string[];
  views: number;
  user: { id: string; name: string | null };
  createdAt: string;
  answers: Answer[];
}

export default function DiscussThreadPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState('');
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch(`/api/discuss/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setQuestion(data.question || data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchQuestion();

    fetch(`/api/discuss/${params.id}`, { method: 'PATCH' });
  }, [params.id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnswerError('');

    if (answerBody.length < 10) {
      setAnswerError('Answer must be at least 10 characters');
      return;
    }

    try {
      const res = await fetch(`/api/discuss/${params.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const newAnswer = await res.json();
        setQuestion((prev) =>
          prev ? { ...prev, answers: [...prev.answers, newAnswer] } : prev
        );
        setAnswerBody('');
      } else {
        const data = await res.json();
        setAnswerError(data.error || 'Failed to post answer');
      }
    } catch {
      setAnswerError('Failed to connect');
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      const res = await fetch(`/api/discuss/${params.id}/answers/${answerId}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setQuestion((prev) =>
          prev
            ? {
                ...prev,
                answers: prev.answers.map((a) => ({
                  ...a,
                  accepted: a.id === answerId ? true : a.accepted,
                })),
              }
            : prev
        );
      }
    } catch {
      // Silent fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5]">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-6 bg-[#F5EDE4] rounded w-1/4 mb-4" />
          <div className="h-8 bg-[#F5EDE4] rounded w-3/4 mb-6" />
          <div className="h-24 bg-[#F5EDE4] rounded mb-8" />
          <div className="h-32 bg-[#F5EDE4] rounded" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl text-[#8B653B] mb-4 font-semibold italic">Question not found</p>
          <Link href="/discuss" className="text-[#543D23] hover:underline font-semibold text-sm">Back to questions</Link>
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === question.user.id;
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/discuss" className="text-sm text-[#B8A080] hover:text-[#543D23] mb-6 inline-block font-semibold">
          Back to Questions
        </Link>

        <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 mb-6 shadow-sm">
          <h1 className="text-3xl text-[#3A2917] mb-3 font-semibold italic">{question.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-[#B8A080]">{question.user.name ?? 'Anonymous'}</span>
            <span className="text-xs text-[#B8A080]">{timeAgo(question.createdAt)}</span>
            <span className="text-xs text-[#B8A080]">{question.views} views</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {question.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-[#F5EDE4] rounded text-xs text-[#8B653B]">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[#3A2917] leading-relaxed whitespace-pre-wrap">{question.body}</p>
        </div>

        <h2 className="text-2xl text-[#3A2917] mb-4 font-semibold italic">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {question.answers.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 text-center mb-6 shadow-sm">
            <p className="text-[#B8A080]">No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`bg-white/80 backdrop-blur-sm border ${answer.accepted ? 'border-green-500 border-2' : 'border-[#D4B896]'} rounded-xl p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#3A2917]">
                      {answer.user.name ?? 'Anonymous'}
                    </span>
                    <span className="text-xs text-[#B8A080]">{timeAgo(answer.createdAt)}</span>
                  </div>
                  {isAuthor && !answer.accepted && (
                    <button
                      onClick={() => handleAccept(answer.id)}
                      className="px-3 py-1 text-xs font-semibold text-[#543D23] border border-[#543D23] rounded hover:bg-[#543D23] hover:text-white transition-colors"
                    >
                      Accept
                    </button>
                  )}
                  {answer.accepted && (
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded">
                      Accepted
                    </span>
                  )}
                </div>
                <p className="text-[#3A2917] leading-relaxed whitespace-pre-wrap">{answer.body}</p>
              </div>
            ))}
          </div>
        )}

        {session ? (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-6 shadow-sm">
            <h3 className="text-xl text-[#3A2917] mb-4 font-semibold italic">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write your answer..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#D4B896] rounded-lg text-[#3A2917] placeholder:text-[#B8A080] focus:outline-none focus:ring-2 focus:ring-[#543D23]/30 focus:border-[#543D23] resize-none"
              />
              {answerError && <p className="text-sm text-red-600">{answerError}</p>}
              <button
                type="submit"
                className="bg-[#543D23] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#3A2917] transition-colors"
              >
                Post Answer
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-xl p-8 text-center shadow-sm">
            <p className="text-[#B8A080] mb-3">Sign in to answer this question</p>
            <Link
              href="/login"
              className="bg-[#543D23] text-white px-6 py-2.5 rounded-lg text-sm font-semibold inline-block hover:bg-[#3A2917]"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}