import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Character } from '../types/Character';
import { getTotalStatPoints } from '../utils/characterUtils';

interface Errors {
  [key: string]: string | undefined;
}

interface UseCharacterFormProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

interface UseCharacterFormReturn {
  formCharacter: Character;
  errors: Errors;
  tagInput: string;
  handleChange: <K extends keyof Character>(key: K, value: Character[K]) => void;
  handleTotalHPChange: (value: number) => void;
  handleStatChange: <K extends keyof Character['stats']>(key: K, value: number) => void;
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addTag: () => void;
  removeTag: (tagToRemove: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function useCharacterForm({ character, onSave, onCancel }: UseCharacterFormProps): UseCharacterFormReturn {
  const [formCharacter, setFormCharacter] = useState<Character>(character || {} as Character);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  // Memoize total stat points to avoid recalculation
  const totalStatPoints = useMemo(() => getTotalStatPoints(), []);

  // Memoize stats validation function
  const validateStats = useCallback((stats: Character['stats']) => {
    const statsSum = Object.values(stats || {}).reduce((a, b) => a + b, 0);
    if (statsSum > totalStatPoints) {
      return `Total stats (${statsSum}) exceed maximum allowed (${totalStatPoints})`;
    }
    return undefined;
  }, [totalStatPoints]);

  // Validation function
  const validate = useCallback((character: Character): Errors => {
    const newErrors: Errors = {};

    if (!character.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (character.currentHp > character.totalHp) {
      newErrors.currentHp = 'Current HP cannot exceed Total HP';
    }

    if (character.currentHp < 0) {
      newErrors.currentHp = 'Current HP cannot be negative';
    }

    if (character.ap < 0) {
      newErrors.ap = 'AP cannot be negative';
    }

    // Use memoized stats validation
    const statsError = validateStats(character.stats);
    if (statsError) {
      newErrors.stats = statsError;
    }

    setErrors(newErrors);
    return newErrors;
  }, [validateStats]);

  // Reset form when character prop changes
  useEffect(() => {
    if (character) {
      setFormCharacter(character);
    }
    setTagInput('');
  }, [character]);

  // Validate on character changes
  useEffect(() => {
    validate(formCharacter);
  }, [formCharacter, validate]);

  const handleChange = useCallback(<K extends keyof Character>(key: K, value: Character[K]) => {
    setFormCharacter(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTotalHPChange = useCallback((value: number) => {
    setFormCharacter(prev => {
      const shouldSyncHp = prev.currentHp === prev.totalHp;
      return {
        ...prev,
        totalHp: value,
        currentHp: shouldSyncHp ? value : prev.currentHp,
      };
    });
  }, []);

  const handleStatChange = useCallback(<K extends keyof Character['stats']>(key: K, value: number) => {
    setFormCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [key]: value,
      },
    }));
  }, []);

  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  }, []);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formCharacter.tags?.includes(newTag)) {
        setFormCharacter(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }));
        setTagInput('');
      }
    }
  }, [tagInput, formCharacter.tags]);

  const addTag = useCallback(() => {
    const newTag = tagInput.trim();
    if (newTag && !formCharacter.tags?.includes(newTag)) {
      setFormCharacter(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setTagInput('');
    }
  }, [tagInput, formCharacter.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormCharacter(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tagToRemove) || [],
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = validate(formCharacter);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Check stats total
    const statsSum = Object.values(formCharacter.stats || {}).reduce((a, b) => a + b, 0);
    const expectedTotal = getTotalStatPoints();

    if (statsSum !== expectedTotal) {
      const confirmed = window.confirm(
        `The total stat points (${statsSum}) do not equal the expected total (${expectedTotal}). Are you sure you want to proceed?`
      );
      if (!confirmed) {
        return;
      }
    }

    onSave(formCharacter);
  }, [formCharacter, onSave, validate]);

  return {
    formCharacter,
    errors,
    tagInput,
    handleChange,
    handleTotalHPChange,
    handleStatChange,
    handleTagInputChange,
    handleTagKeyDown,
    addTag,
    removeTag,
    handleSubmit,
  };
} 