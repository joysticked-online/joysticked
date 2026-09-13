'use client';

import { CheckCircle2, ExternalLink, Eye, EyeOff, Gamepad2, RefreshCw, Unlink } from 'lucide-react';
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
      toast.info('Conta Steam desvinculada.');
    } catch {
      onUpdate({
        steam: null,
        steamId: null,
        steamPublic: false
      });
      toast.info('Conta Steam desvinculada.');
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
          ? 'Link da Steam visível no perfil público.'
          : 'Link da Steam oculto no perfil público.'
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
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBase}/steam/games`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Steam sync failed');
      }

      toast.success('Biblioteca Steam atualizada com sucesso!');
    } catch {
      toast.error('Não foi possível atualizar a biblioteca Steam.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[20px] bg-white/[0.02] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06] text-white ring-1 ring-white/10">
            <Gamepad2 className="size-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-sans text-base text-white tracking-tight">
                Vincular Conta Steam
              </h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-bold font-mono text-[9px] text-black uppercase tracking-wider">
                  <CheckCircle2 className="size-2.5" />
                  Conectado
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 [text-wrap:pretty]">
              Sincronize automaticamente suas horas jogadas, biblioteca e conquistas.
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            type="button"
            onClick={handleSyncStats}
            disabled={isSyncing}
            className="hidden items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-1.5 font-medium text-xs text-zinc-300 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96] disabled:opacity-50 sm:inline-flex"
            title="Sincronizar agora"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando…' : 'Sincronizar'}</span>
          </button>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-3 pt-1">
          {/* Connected Details Bar */}
          <div className="flex flex-col justify-between gap-3 rounded-xl bg-white/[0.03] p-3.5 px-4 ring-1 ring-white/[0.06] sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800 font-bold font-mono text-white text-xs">
                {steam?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span>{steam || 'Steam Player'}</span>
                  <a
                    href={
                      steamId
                        ? `https://steamcommunity.com/profiles/${steamId}`
                        : `https://steamcommunity.com/id/${steam}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                {steamId && (
                  <span className="font-mono text-[10px] text-zinc-500">SteamID: {steamId}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUnlink}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.06] transition-colors hover:bg-rose-500/10 hover:text-rose-400 active:scale-[0.96]"
              >
                <Unlink className="size-3.5" />
                <span>Desvincular</span>
              </button>
            </div>
          </div>

          {/* Privacy & Visibility Toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.02] p-3.5 ring-1 ring-white/[0.04] sm:p-4">
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                {isPublic ? (
                  <>
                    <Eye className="size-3.5 text-zinc-400" />
                    <span>Exibir Steam no perfil público</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5 text-zinc-400" />
                    <span>Steam Privada (Oculta no perfil)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed [text-wrap:pretty]">
                {isPublic
                  ? 'Seu badge e link da Steam estão visíveis para todos os visitantes do perfil.'
                  : 'Oculto para visitantes, mantendo horas e conquistas sincronizadas no sistema.'}
              </p>
            </div>

            {/* Tactile Switch Toggle */}
            <button
              type="button"
              onClick={handleTogglePrivacy}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 active:scale-[0.96] ${
                isPublic ? 'bg-white' : 'bg-zinc-800 ring-1 ring-white/10'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-black shadow-md transition duration-200 ${
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 font-medium text-white text-xs ring-1 ring-white/10 transition-all hover:bg-white/[0.1] active:scale-[0.96]"
          >
            <Gamepad2 className="size-4 text-white" />
            <span>Conectar com a Steam (OpenID)</span>
          </button>
        </div>
      )}
    </div>
  );
}
