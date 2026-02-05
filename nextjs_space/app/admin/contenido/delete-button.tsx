'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteArticleButtonProps {
  articleId: string;
  title: string;
}

export function DeleteArticleButton({ articleId, title }: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contenido/${articleId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar');

      router.refresh();
    } catch (error) {
      alert('Error al eliminar el contenido');
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
