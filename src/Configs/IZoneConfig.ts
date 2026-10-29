import { type IVector2 } from "../Model/IVector2";

export interface IZoneConfig {
    readonly id: string;
    readonly center: IVector2;
    readonly radius: number;
    readonly initialOwningFactionId: string | null;
    readonly incomeAmount?: number;
    readonly incomeIntervalMs?: number;
    readonly captureThreshold?: number;
    readonly capturingPlayersLimit?: number;
    readonly captureRatePerPlayerPerSecond?: number;
    readonly captureDecayRatePerSecond?: number;
}