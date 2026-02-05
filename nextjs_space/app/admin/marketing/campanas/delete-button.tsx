'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteCampaignButtonProps {
  campaignId: string;
  campaignName: string;
}

export function DeleteCampaignButton({ campaignId, campaignName }: DeleteCampaignButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la campaña "${campaignName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar');

      router.refresh();
    } catch (error) {
      alert('Error al eliminar la campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
