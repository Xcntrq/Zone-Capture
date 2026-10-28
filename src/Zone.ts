import { type IVector2, distSqr } from "./IVector2";
import { type IZoneConfig } from "./IZoneConfig";
import { type IGlobalConfig } from "./IGlobalConfig";
import { type IZoneState } from "./IZoneState";

export class Zone {
    public readonly id: string;
    public readonly center: IVector2;
    public readonly radius: number;
    public readonly incomeAmount: number;
    public readonly incomeIntervalMs: number;
    public readonly captureThreshold: number;
    public readonly capturingPlayersLimit: number;
    public readonly captureRatePerPlayerPerSecond: number;
    public readonly captureDecayRatePerSecond: number;

    public nextIncomeAt: number;
    public owningFactionId: string | null;
    public capturingFactionId: string | null = null;
    public captureProgress: number = 0;
    public isContested: boolean = false;

    public constructor(zoneConfig: IZoneConfig, globalConfig: IGlobalConfig, nowMs: number) {
        this.id = zoneConfig.id;
        this.center = zoneConfig.center;
        this.radius = zoneConfig.radius;
        this.owningFactionId = zoneConfig.initialOwningFactionId;
        this.incomeAmount = zoneConfig.incomeAmount ?? globalConfig.defaultZoneIncomeAmount;
        this.incomeIntervalMs = zoneConfig.incomeIntervalMs ?? globalConfig.defaultZoneIncomeIntervalMs;
        this.captureThreshold = zoneConfig.captureThreshold ?? globalConfig.defaultZoneCaptureThreshold;
        this.capturingPlayersLimit = zoneConfig.capturingPlayersLimit ?? globalConfig.defaultZoneCapturingPlayersLimit;
        this.captureRatePerPlayerPerSecond = zoneConfig.captureRatePerPlayerPerSecond ?? globalConfig.defaultZoneCaptureRatePerPlayerPerSecond;
        this.captureDecayRatePerSecond = zoneConfig.captureDecayRatePerSecond ?? globalConfig.defaultZoneCaptureDecayRatePerSecond;
        this.nextIncomeAt = nowMs + this.incomeIntervalMs;
    }

    public containsPoint(point: IVector2): boolean {
        return distSqr(this.center, point) <= this.radius * this.radius;
    }

    public toState(): IZoneState {
        return {
            id: this.id,
            center: this.center,
            radius: this.radius,
            incomeAmount: this.incomeAmount,
            incomeIntervalMs: this.incomeIntervalMs,
            captureThreshold: this.captureThreshold,
            owningFactionId: this.owningFactionId,
            capturingFactionId: this.capturingFactionId,
            captureProgress: this.captureProgress,
            isContested: this.isContested,
        };
    }
}