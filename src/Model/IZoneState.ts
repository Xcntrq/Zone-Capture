import { type IVector2 } from "./IVector2";

export interface IZoneState {
    readonly id: string;
    readonly center: IVector2;
    readonly radius: number;
    readonly incomeAmount: number;
    readonly incomeIntervalMs: number;
    readonly captureThreshold: number;
    readonly owningFactionId: string | null;
    readonly capturingFactionId: string | null;
    readonly captureProgress: number;
    readonly isContested: boolean;
}