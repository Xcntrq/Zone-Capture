import { type IVector2 } from "./IVector2";
import { type IZoneConfig } from "./IZoneConfig";
import { type IGlobalConfig } from "./IGlobalConfig";

export class Zone {
    public readonly id: string;
    public readonly center: IVector2;
    public readonly radius: number;
    public readonly incomePerSecond: number;

    public owningFactionId: string | null;
    public capturingFactionId: string | null = null;
    public captureProgress: number = 0;

    public constructor(zoneConfig: IZoneConfig, globalConfig: IGlobalConfig) {
        this.id = zoneConfig.id;
        this.center = zoneConfig.center;
        this.radius = zoneConfig.radius;
        this.owningFactionId = zoneConfig.initialOwningFactionId;
        this.incomePerSecond = zoneConfig.incomePerSecond ?? globalConfig.defaultZoneIncomePerSecond;
    }
}