export const defaultIceServers = [{ urls: "stun:stun.l.google.com:19302" }];
export type PeerInfo = { id: string };
export type P2PRoomOptions = { roomId?: string };
export type SignalKind = string;
export type PeerRow = { id: string };
export type SignalRow = { id: string };
export type RtcPollResponse = { ok: boolean };
export class P2PRoom {
  constructor(_opts?: P2PRoomOptions) {}
  close() {}
}
