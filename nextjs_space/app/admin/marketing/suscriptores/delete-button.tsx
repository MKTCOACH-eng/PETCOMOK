'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteSubscriberButtonProps {
  subscriberId: string;
  email: string;
}

export function DeleteSubscriberButton({ subscriberId, email }: DeleteSubscriberButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el suscriptor ${email}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/subscribers/${subscriberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar');

      router.refresh();
    } catch (error) {
      alert('Error al eliminar el suscriptor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
