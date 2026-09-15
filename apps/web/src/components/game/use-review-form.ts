import { useEffect, useState } from 'react';
import type { Game, GameReview } from '@/lib/games';

export function useReviewForm(game: Game, initialReview?: GameReview | null) {
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [reviewText, setReviewText] = useState(initialReview?.reviewText || '');
  const [containsSpoiler, setContainsSpoiler] = useState(initialReview?.containsSpoiler ?? false);
  const [selectedPlatform, setSelectedPlatform] = useState(
    initialReview?.platform || game.platforms?.[0] || ''
  );
  const [hoursPlayed, setHoursPlayed] = useState(initialReview?.hoursPlayed || '');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setRating(initialReview?.rating || 5);
    setReviewText(initialReview?.reviewText || '');
    setContainsSpoiler(initialReview?.containsSpoiler ?? false);
    setSelectedPlatform(initialReview?.platform || game.platforms?.[0] || '');
    setHoursPlayed(initialReview?.hoursPlayed || '');
    setCustomTags([]);
    setTagInput('');
  }, [initialReview, game.platforms]);

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || customTags.includes(trimmed)) return;
    setCustomTags((tags) => [...tags, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setCustomTags((tags) => tags.filter((currentTag) => currentTag !== tag));
  };

  return {
    addTag,
    containsSpoiler,
    customTags,
    hoursPlayed,
    rating,
    removeTag,
    reviewText,
    selectedPlatform,
    setContainsSpoiler,
    setHoursPlayed,
    setRating,
    setReviewText,
    setSelectedPlatform,
    setTagInput,
    tagInput
  };
}
