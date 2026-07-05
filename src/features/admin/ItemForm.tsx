'use client';

import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WishlistItemInput } from '@/lib/wishlist-db';

const EMPTY: WishlistItemInput = { brand: '', name: '', image: '', link: '' };

const FIELDS: { key: keyof WishlistItemInput; label: string; placeholder: string }[] = [
  { key: 'brand', label: 'Brand', placeholder: 'Lovevery' },
  { key: 'name', label: 'Name', placeholder: 'The Play Gym' },
  { key: 'link', label: 'Product link', placeholder: 'https://…' },
  { key: 'image', label: 'Image (URL or /images/…)', placeholder: '/images/item-1.jpg' },
];

type ItemFormProps = {
  initialValues?: WishlistItemInput;
  submitLabel: string;
  onSubmit: (values: WishlistItemInput) => Promise<void>;
  onCancel: () => void;
};

/** Controlled create/edit form. The parent's onSubmit throws on failure. */
export default function ItemForm({ initialValues, submitLabel, onSubmit, onCancel }: ItemFormProps) {
  const [values, setValues] = useState<WishlistItemInput>(initialValues ?? EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  const update = (key: keyof WishlistItemInput) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 ring-1 ring-black/5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-${key}`}>{label}</Label>
            <Input
              id={`${fieldId}-${key}`}
              value={values[key]}
              onChange={update(key)}
              placeholder={placeholder}
              disabled={pending}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
