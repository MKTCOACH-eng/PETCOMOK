'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, UserX } from 'lucide-react';

interface ToggleStatusButtonProps {
  subscriberId: string;
  isActive: boolean;
}

export function ToggleStatusButton({ subscriberId, isActive }: ToggleStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/subscribers/${subscriberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error('Error al actualizar');

      router.refresh();
    } catch (error) {
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
        isActive 
          ? 'text-orange-600 hover:bg-orange-50' 
          : 'text-green-600 hover:bg-green-50'
      }`}
      title={isActive ? 'Desactivar' : 'Activar'}
    >
      {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
    </button>
  );
}
