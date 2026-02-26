'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Send, ThumbsUp, Sparkles, CheckCircle } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants';

interface Idea {
  id: string;
  name: string;
  email: string;
  type: string;
  title: string;
  description: string;
  willingToHelp: boolean;
  votes: number;
  createdAt: string;
}

const IDEA_TYPES = ['Workshop', 'Event', 'Improvement', 'Partnership', 'Other'] as const;

const TYPE_BADGE_COLORS: Record<string, string> = {
  Workshop: 'bg-green-500/15 text-green-400 border-green-500/30',
  Event: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Improvement: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Partnership: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Other: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const DEMO_IDEAS: Idea[] = [
  {
    id: 'idea-1',
    name: 'Jamie Renault',
    email: 'jamie@example.com',
    type: 'Workshop',
    title: 'Pottery Wheel Workshop Series',
    description:
      'A 4-week progressive workshop series going from centering clay to glazing finished pieces. Would be great to offer in the Main Studio with the new pottery wheel.',
    willingToHelp: true,
    votes: 12,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'idea-2',
    name: 'River Eastman',
    email: 'river@example.com',
    type: 'Improvement',
    title: 'Install Better Ventilation in Print Lab',
    description:
      'The print lab could use a dedicated exhaust fan for solvent-based inks. This would make it safer for longer printing sessions and open up more ink options.',
    willingToHelp: false,
    votes: 8,
    createdAt: '2026-02-18T14:30:00Z',
  },
  {
    id: 'idea-3',
    name: 'Sage Whitfield',
    email: 'sage@example.com',
    type: 'Partnership',
    title: 'Partner with MDI Biological Lab for Science Art',
    description:
      'MDI Bio Lab has amazing microscopy imagery. A collaboration could produce an exhibition merging science and art, plus cross-promote both organizations to new audiences.',
    willingToHelp: true,
    votes: 15,
    createdAt: '2026-02-20T09:15:00Z',
  },
  {
    id: 'idea-4',
    name: 'Avery Stonecrest',
    email: 'avery@example.com',
    type: 'Event',
    title: 'Monthly Maker Market on Main Street',
    description:
      'Set up a pop-up market on the first Saturday of each month where local makers can sell their work. Could partner with downtown businesses for foot traffic.',
    willingToHelp: true,
    votes: 19,
    createdAt: '2026-02-22T11:00:00Z',
  },
];

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function IdeaBoard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Workshop',
    title: '',
    description: '',
    willingToHelp: false,
  });
  const [submitted, setSubmitted] = useState(false);

  // Load ideas and votes from localStorage on mount
  useEffect(() => {
    const storedIdeas = localStorage.getItem(STORAGE_KEYS.IDEAS);
    if (storedIdeas) {
      try {
        setIdeas(JSON.parse(storedIdeas));
      } catch {
        localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
        setIdeas(DEMO_IDEAS);
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(DEMO_IDEAS));
      setIdeas(DEMO_IDEAS);
    }

    const storedVotes = localStorage.getItem(STORAGE_KEYS.IDEA_VOTES);
    if (storedVotes) {
      try {
        setVotedIds(JSON.parse(storedVotes));
      } catch {
        setVotedIds([]);
      }
    }
  }, []);

  const persistIdeas = useCallback((updated: Idea[]) => {
    setIdeas(updated);
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(updated));
  }, []);

  const persistVotes = useCallback((updated: string[]) => {
    setVotedIds(updated);
    localStorage.setItem(STORAGE_KEYS.IDEA_VOTES, JSON.stringify(updated));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.description.trim()) return;

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      willingToHelp: formData.willingToHelp,
      votes: 0,
      createdAt: new Date().toISOString(),
    };

    persistIdeas([newIdea, ...ideas]);
    setFormData({
      name: '',
      email: '',
      type: 'Workshop',
      title: '',
      description: '',
      willingToHelp: false,
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleVote = (ideaId: string) => {
    if (votedIds.includes(ideaId)) return;

    const updatedIdeas = ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
    );
    persistIdeas(updatedIdeas);
    persistVotes([...votedIds, ideaId]);
  };

  return (
    <div className="space-y-6">
      {/* Submission Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Share Your Idea</h2>
            <p className="text-sm text-slate-400">
              Have a suggestion for the makerspace? We want to hear it.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Idea Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={INPUT_CLASS}
              >
                {IDEA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your idea a title"
                required
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your idea in detail..."
              required
              rows={3}
              className={INPUT_CLASS + ' resize-none'}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="willingToHelp"
              checked={formData.willingToHelp}
              onChange={(e) => setFormData({ ...formData, willingToHelp: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
            />
            <label htmlFor="willingToHelp" className="text-sm text-slate-300 cursor-pointer">
              I&apos;m willing to help make this happen
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Submit Idea
            </button>
            {submitted && (
              <span className="flex items-center gap-1.5 text-sm text-green-400 animate-pulse">
                <CheckCircle className="w-4 h-4" />
                Idea submitted!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Community Ideas Display */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-semibold text-white">Community Ideas</h2>
          <span className="text-sm text-slate-500">({ideas.length})</span>
        </div>

        {ideas.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
            <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No ideas yet. Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ideas.map((idea) => {
              const hasVoted = votedIds.includes(idea.id);
              const badgeColor = TYPE_BADGE_COLORS[idea.type] || TYPE_BADGE_COLORS.Other;

              return (
                <div
                  key={idea.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col"
                >
                  {/* Type Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}
                    >
                      {idea.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white mb-1.5">{idea.title}</h3>

                  {/* Description excerpt */}
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                    {idea.description}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                      <span className="truncate font-medium text-slate-400">{idea.name}</span>
                      <span className="shrink-0">&middot;</span>
                      <span className="shrink-0">{formatDate(idea.createdAt)}</span>
                    </div>

                    <button
                      onClick={() => handleVote(idea.id)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        hasVoted
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-400' : ''}`}
                      />
                      {idea.votes}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
