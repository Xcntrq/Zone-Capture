import { type ResetZoneCaptureUseCase } from "./ResetZoneCaptureUseCase";
import { type Zone } from "./Zone";

export class SetZoneOwnerUseCase {
    private readonly resetZoneCaptureUseCase: ResetZoneCaptureUseCase;

    public constructor(resetZoneCaptureUseCase: ResetZoneCaptureUseCase) {
        this.resetZoneCaptureUseCase = resetZoneCaptureUseCase;
    }

    public execute(zone: Zone, factionId: string | null, nowMs: number): void {
        zone.owningFactionId = factionId;
        zone.nextIncomeAt = nowMs + zone.incomeIntervalMs;
        this.resetZoneCaptureUseCase.execute(zone);
    }
}