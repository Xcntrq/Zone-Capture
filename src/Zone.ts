import { type IVector2, distSqr, isVectorFinite } from "./IVector2";
import { type IZoneConfig } from "./IZoneConfig";
import { type IGlobalConfig } from "./IGlobalConfig";
import { type IZoneState } from "./IZoneState";

export class Zone {
    private static validateCenter(zoneId: string, center: IVector2): IVector2 {
        if (!isVectorFinite(center)) {
            throw new Error(`Invalid center for zone "${zoneId}": "${center.x},${center.y}" is not finite`);
        }

        return center;
    }

    private static validatePositiveInt(zoneId: string, name: string, value: number): number {
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error(`Invalid value for zone "${zoneId}": "${name}" is "${value}" but it must be a positive integer`);
        }

        return value;
    }

    private static validateNonNegativeInt(zoneId: string, name: string, value: number): number {
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new Error(`Invalid value for zone "${zoneId}": "${name}" is "${value}" but it must be a non-negative integer`);
        }

        return value;
    }

    private static validatePositiveFloat(zoneId: string, name: string, value: number): number {
        if (!Number.isFinite(value) || value <= 0) {
            throw new Error(`Invalid value for zone "${zoneId}": "${name}" is "${value}" but it must be a positive finite number`);
        }

        return value;
    }

    private static validateNonNegativeFloat(zoneId: string, name: string, value: number): number {
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(`Invalid value for zone "${zoneId}": "${name}" is "${value}" but it must be a non-negative finite number`);
        }

        return value;
    }

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
        this.center = Zone.validateCenter(this.id, zoneConfig.center);
        this.radius = Zone.validatePositiveFloat(this.id, "radius", zoneConfig.radius);
        this.owningFactionId = zoneConfig.initialOwningFactionId;
        this.incomeAmount = Zone.validateNonNegativeInt(this.id, "incomeAmount", zoneConfig.incomeAmount ?? globalConfig.defaultZoneIncomeAmount);
        this.incomeIntervalMs = Zone.validatePositiveInt(this.id, "incomeIntervalMs", zoneConfig.incomeIntervalMs ?? globalConfig.defaultZoneIncomeIntervalMs);
        this.captureThreshold = Zone.validatePositiveFloat(this.id, "captureThreshold", zoneConfig.captureThreshold ?? globalConfig.defaultZoneCaptureThreshold);
        this.capturingPlayersLimit = Zone.validatePositiveInt(this.id, "capturingPlayersLimit", zoneConfig.capturingPlayersLimit ?? globalConfig.defaultZoneCapturingPlayersLimit);
        this.captureRatePerPlayerPerSecond = Zone.validatePositiveFloat(this.id, "captureRatePerPlayerPerSecond", zoneConfig.captureRatePerPlayerPerSecond ?? globalConfig.defaultZoneCaptureRatePerPlayerPerSecond);
        this.captureDecayRatePerSecond = Zone.validateNonNegativeFloat(this.id, "captureDecayRatePerSecond", zoneConfig.captureDecayRatePerSecond ?? globalConfig.defaultZoneCaptureDecayRatePerSecond);
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