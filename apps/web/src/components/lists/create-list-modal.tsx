'use client';

import { Check, ListPlus, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createCustomList } from '@/lib/lists';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdSlug: string, ownerUsername: string) => void;
}

const PRESET_TAGS = ['Favoritos', 'Platinas', 'Backlog', 'Indies', 'Souls-like', 'História', 'Co-op', 'Retrô'];

export function CreateListModal({ isOpen, onClose, onSuccess }: CreateListModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Favoritos']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 4) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe um título para sua lista.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const ownerUsername = user?.username || 'jogador';
    const ownerDisplayName = user?.displayName || user?.username || 'Jogador';
    const ownerAvatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${ownerUsername}`;

    const created = createCustomList({
      name: name.trim(),
      description: description.trim() || undefined,
      ownerUsername,
      ownerDisplayName,
      ownerAvatarUrl,
      isPublic,
      tags: selectedTags
    });

    setIsSubmitting(false);
    onClose();

    if (onSuccess) {
      onSuccess(created.slug, ownerUsername);
    } else {
      router.push(`/list?user=${ownerUsername}&listname=${created.slug}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.95)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white ring-1 ring-white/10">
                  <ListPlus className="size-5" />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-bold text-white tracking-tight">Criar Nova Lista</h2>
                  <p className="text-xs text-neutral-400">Colecione, organize e compartilhe seus jogos favoritos.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="list-name" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Título da Lista <span className="text-rose-400">*</span>
                </label>
                <input
                  id="list-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Melhores RPGs que já joguei, Platinas de 2024..."
                  className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06]"
                />
              </div>

              <div>
                <label htmlFor="list-desc" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Descrição (Opcional)
                </label>
                <textarea
                  id="list-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte um pouco sobre o tema desta lista ou o critério de escolha..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-white placeholder:text-neutral-500 outline-none transition-all hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06]"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Tags temáticas (até 4)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-white text-black font-semibold shadow-sm'
                            : 'border border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-white">Lista Pública</p>
                  <p className="text-[11px] text-neutral-400">Qualquer pessoa com o link poderá visualizar esta lista.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublic ? 'bg-white' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPublic ? 'translate-x-4' : 'translate-x-0 bg-neutral-400'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-white px-5 text-xs font-semibold text-black transition-all hover:bg-neutral-200 disabled:opacity-40 active:scale-[0.98]"
                >
                  <Sparkles className="size-3.5" />
                  <span>{isSubmitting ? 'Criando...' : 'Criar Lista'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
