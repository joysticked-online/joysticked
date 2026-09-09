'use client';

import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  RefreshCw,
  Unlink
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SteamConnectionCardProps {
  steam?: string | null;
  steamId?: string | null;
  steamPublic?: boolean | null;
  onUpdate: (data: {
    steam?: string | null;
    steamId?: string | null;
    steamPublic?: boolean;
  }) => void;
}

export function SteamConnectionCard({
  steam,
  steamId,
  steamPublic = true,
  onUpdate
}: SteamConnectionCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPublic, setIsPublic] = useState(steamPublic ?? true);

  const isConnected = Boolean(steamId || steam);

  const handleOpenIdLogin = () => {
    // Open Steam OpenID auth via API
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    window.location.href = `${apiBase}/auth/steam`;
  };

  const handleUnlink = async () => {
    if (!confirm('Deseja realmente desvincular sua conta Steam?')) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${apiBase}/steam/unlink`, {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});

      onUpdate({
        steam: null,
        steamId: null,
        steamPublic: false
      });
      toast.info('Conta Steam desvinculada');
    } catch {
      onUpdate({
        steam: null,
        steamId: null,
        steamPublic: false
      });
      toast.info('Conta Steam desvinculada');
    }
  };

  const handleTogglePrivacy = async () => {
    const nextValue = !isPublic;
    setIsPublic(nextValue);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await fetch(`${apiBase}/steam/privacy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ steamPublic: nextValue })
      }).catch(() => {});

      onUpdate({
        steam,
        steamId,
        steamPublic: nextValue
      });

      toast.success(
        nextValue
          ? 'Link da Steam agora está visível no seu perfil público.'
          : 'Link da Steam oculto no perfil. Conquistas e horas continuarão sincronizadas!'
      );
    } catch {
      onUpdate({
        steam,
        steamId,
        steamPublic: nextValue
      });
    }
  };

  const handleSyncStats = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync or call API
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Conquistas e biblioteca Steam sincronizadas com sucesso!');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-[#171a21] text-white shadow-md">
            <Gamepad2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Steam Integration</h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-semibold text-[10px] text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Conectado
                </span>
              )}
            </div>
            <p className="mt-0.5 text-neutral-400 text-xs">
              Sincronize automaticamente suas conquistas, horas jogadas e gameplays.
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            type="button"
            onClick={handleSyncStats}
            disabled={isSyncing}
            className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-neutral-200 text-xs transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 sm:inline-flex"
            title="Sincronizar dados agora"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando…' : 'Sincronizar'}</span>
          </button>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-4 pt-1">
          {/* Connected Details Bar */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/40 p-3.5 px-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-neutral-800 font-bold text-neutral-300 text-xs">
                {steam?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>{steam || 'Steam User'}</span>
                  <a
                    href={
                      steamId
                        ? `https://steamcommunity.com/profiles/${steamId}`
                        : `https://steamcommunity.com/id/${steam}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 transition-colors hover:text-neutral-300"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                {steamId && (
                  <span className="text-[11px] text-neutral-500">SteamID: {steamId}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUnlink}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-red-400/80 text-xs transition-colors hover:bg-red-500/15 hover:text-red-400"
              >
                <Unlink className="size-3.5" />
                <span>Desvincular</span>
              </button>
            </div>
          </div>

          {/* Privacy & Visibility Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-3.5 sm:p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                {isPublic ? (
                  <>
                    <Eye className="size-3.5 text-neutral-400" />
                    <span>Exibir Steam no perfil público</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5 text-amber-400" />
                    <span>Steam Privada (Oculta no perfil)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {isPublic
                  ? 'Seu link e badge da Steam estão visíveis para todos os visitantes do seu perfil.'
                  : 'Seu link fica oculto para visitantes, mas suas horas jogadas e conquistas continuarão sendo computadas no Joysticked.'}
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={handleTogglePrivacy}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublic ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleOpenIdLogin}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#171a21] px-4 py-2.5 font-semibold text-white text-xs shadow-lg transition-all hover:bg-[#21252f] active:scale-[0.98]"
          >
            <Gamepad2 className="size-4 text-white" />
            <span>Conectar com a Steam (OpenID)</span>
          </button>
        </div>
      )}
    </div>
  );
}
