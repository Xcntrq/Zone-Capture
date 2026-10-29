import { type ResetZoneCaptureUseCase } from "./ResetZoneCaptureUseCase";
import { type SetZoneOwnerUseCase } from "./SetZoneOwnerUseCase";
import { type Zone } from "../Model/Zone";

export type AdvanceZoneCaptureResult = "notFullyCaptured" | "fullyCaptured";

export class AdvanceZoneCaptureUseCase {
    private static readonly EPSILON: number = 1e-9;

    private readonly resetZoneCaptureUseCase: ResetZoneCaptureUseCase;
    private readonly setZoneOwnerUseCase: SetZoneOwnerUseCase;

    public constructor(resetZoneCaptureUseCase: ResetZoneCaptureUseCase, setZoneOwnerUseCase: SetZoneOwnerUseCase) {
        this.resetZoneCaptureUseCase = resetZoneCaptureUseCase;
        this.setZoneOwnerUseCase = setZoneOwnerUseCase;
    }

    public execute(zone: Zone, factionId: string, playerCount: number, dtSec: number, nowMs: number): AdvanceZoneCaptureResult {
        if (zone.capturingFactionId !== factionId) {
            this.resetZoneCaptureUseCase.execute(zone);
            zone.capturingFactionId = factionId;
        }

        const effectivePlayerCount = Math.min(playerCount, zone.capturingPlayersLimit);
        zone.captureProgress += zone.captureRatePerPlayerPerSecond * effectivePlayerCount * dtSec;

        if (zone.captureProgress >= zone.captureThreshold - AdvanceZoneCaptureUseCase.EPSILON) {
            this.setZoneOwnerUseCase.execute(zone, factionId, nowMs);
            return "fullyCaptured";
        }

        return "notFullyCaptured";
    }
}