'use client';

import { Edit3, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { type UserList, updateUserList } from '@/lib/lists';

interface EditListModalProps {
  isOpen: boolean;
  list: UserList;
  onClose: () => void;
  onUpdate: (updatedList: UserList) => void;
}

const PRESET_TAGS = [
  'Favoritos',
  'Platinas',
  'Backlog',
  'Indies',
  'Souls-like',
  'História',
  'Co-op',
  'Retrô'
];

export function EditListModal({ isOpen, list, onClose, onUpdate }: EditListModalProps) {
  const handleOpenChange = useCallback((open: boolean) => { if (!open) onClose(); }, [onClose]);
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || '');
  const [isPublic, setIsPublic] = useState(list.isPublic ?? true);
  const [selectedTags, setSelectedTags] = useState<string[]>(list.tags || ['Favoritos']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when list changes
  useEffect(() => {
    if (isOpen && list) {
      setName(list.name);
      setDescription(list.description || '');
      setIsPublic(list.isPublic ?? true);
      setSelectedTags(list.tags || ['Favoritos']);
      setError(null);
    }
  }, [isOpen, list]);

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

    const updated = updateUserList(list.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
      tags: selectedTags
    });

    setIsSubmitting(false);

    if (updated) {
      onUpdate(updated);
      onClose();
    } else {
      setError('Não foi possível salvar as alterações.');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Editar lista"
      description="Atualize o título, a descrição, as tags e a privacidade da lista."
    >
      <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e12] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.95)] sm:p-7"
      >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white ring-1 ring-white/10">
                  <Edit3 className="size-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-bold font-sans text-lg text-white tracking-tight">
                    Editar Lista
                  </h2>
                  <p className="text-neutral-400 text-xs">
                    Atualize o título, descrição e categorias da coleção.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar diálogo"
                className="flex size-8 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* List Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit-list-name" className="font-semibold text-neutral-300 text-xs">
                  Nome da Lista <span className="text-rose-400">*</span>
                </label>
                <input
                  id="edit-list-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Melhores RPGs da Geração"
                  maxLength={70}
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-white text-xs outline-none transition-all placeholder:text-neutral-500 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="edit-list-desc" className="font-semibold text-neutral-300 text-xs">
                  Descrição <span className="font-normal text-neutral-500">(opcional)</span>
                </label>
                <textarea
                  id="edit-list-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escreva uma breve introdução sobre os jogos escolhidos e o motivo do ranking..."
                  rows={3}
                  maxLength={300}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white text-xs outline-none transition-all placeholder:text-neutral-500 hover:border-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                />
              </div>

              {/* Preset Tags */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between font-semibold text-neutral-300 text-xs">
                  <span>Tags da Coleção</span>
                  <span className="text-[10px] text-neutral-500">Máximo 4</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={isSelected}
                        className={`rounded-lg px-2.5 py-1 font-medium text-xs transition-all active:scale-95 ${
                          isSelected
                            ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm'
                            : 'border border-white/[0.07] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 pt-2 pb-2">
                <div>
                  <span className="font-semibold text-white text-xs">Lista Pública</span>
                  <p className="text-[11px] text-neutral-400">
                    Permitir que outros jogadores descubram e curtam sua lista
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  role="switch"
                  aria-checked={isPublic}
                  aria-label="Lista pública"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublic ? 'bg-amber-400' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 font-semibold text-neutral-300 text-xs transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2 font-bold text-black text-xs shadow-lg transition-all hover:bg-neutral-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
      </motion.div>
    </Dialog>
  );
}
