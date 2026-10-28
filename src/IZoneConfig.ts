import { type IVector2 } from "./IVector2";

export interface IZoneConfig {
    readonly id: string;
    readonly center: IVector2;
    readonly radius: number;
    readonly initialOwningFactionId: string | null;
    readonly incomePerSecond?: number;
}