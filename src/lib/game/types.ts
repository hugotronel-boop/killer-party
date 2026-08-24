export type PartyStatus = "lobby" | "playing" | "finished";

export type PublicPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  isAlive: boolean;
  killCount: number;
  discovered: boolean;
};

export type KillClaimView = {
  id: string;
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  mission: string;
  explanation: string;
  status: "pending" | "validated" | "refused";
  createdAt: string;
};

export type RecapEvent = {
  id: string;
  killerName: string;
  victimName: string;
  createdAt: string;
};

export type GameSnapshot = {
  party: {
    id: string;
    code: string;
    status: PartyStatus;
    isDemo: boolean;
    aliveCount: number;
    totalCount: number;
    winnerId: string | null;
    winnerName: string | null;
  };
  me: {
    id: string;
    name: string;
    isHost: boolean;
    isAlive: boolean;
    killCount: number;
    discovered: boolean;
    accusationCooldownMs: number;
  };
  target: { id: string; name: string } | null;
  mission: string | null;
  pendingClaim: KillClaimView | null;
  players: PublicPlayer[];
  claims: KillClaimView[];
  recap: RecapEvent[];
  hostTokens?: Record<string, string>;
};

export type SessionRecord = {
  partyId: string;
  code: string;
  playerId: string;
  token: string;
  hostToken?: string;
  name: string;
};
