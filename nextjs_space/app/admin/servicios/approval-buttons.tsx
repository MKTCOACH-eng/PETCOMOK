'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Star, StarOff, Loader2 } from 'lucide-react';

interface Provider {
  id: string;
  isApproved: boolean;
  featured: boolean;
  membershipStatus: string;
}

export function ApprovalButtons({ provider }: { provider: Provider }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject' | 'activate' | 'feature') => {
    setLoading(true);
    try {
      const updates: any = {};
      
      if (action === 'approve') {
        updates.isApproved = true;
        updates.membershipStatus = 'active';
      } else if (action === 'reject') {
        updates.isApproved = false;
      } else if (action === 'activate') {
        updates.membershipStatus = 'active';
      } else if (action === 'feature') {
        updates.featured = !provider.featured;
      }

      await fetch(`/api/admin/servicios/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!provider.isApproved ? (
        <>
          <button
            onClick={() => handleAction('approve')}
            className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar
          </button>
          <button
            onClick={() => handleAction('reject')}
            className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
        </>
      ) : (
        <>
          {provider.membershipStatus !== 'active' && (
            <button
              onClick={() => handleAction('activate')}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Activar
            </button>
          )}
          <button
            onClick={() => handleAction('feature')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 ${
              provider.featured
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {provider.featured ? (
              <><StarOff className="w-4 h-4" /> Quitar destacado</>
            ) : (
              <><Star className="w-4 h-4" /> Destacar</>
            )}
          </button>
        </>
      )}
    </div>
  );
}
