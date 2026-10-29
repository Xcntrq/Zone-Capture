import { type ResetZoneCaptureUseCase } from "./ResetZoneCaptureUseCase";
import { type Zone } from "../Model/Zone";

export type DecayZoneCaptureResult = "noCapturingFaction" | "decayedPartially" | "decayedToZero";

export class DecayZoneCaptureUseCase {
    private static readonly EPSILON: number = 1e-9;

    private readonly resetZoneCaptureUseCase: ResetZoneCaptureUseCase;

    public constructor(resetZoneCaptureUseCase: ResetZoneCaptureUseCase) {
        this.resetZoneCaptureUseCase = resetZoneCaptureUseCase;
    }

    public execute(zone: Zone, dtSec: number): DecayZoneCaptureResult {
        if (zone.capturingFactionId === null) {
            return "noCapturingFaction";
        }

        const newCaptureProgress = zone.captureProgress - zone.captureDecayRatePerSecond * dtSec;
        if (newCaptureProgress > DecayZoneCaptureUseCase.EPSILON) {
            zone.captureProgress = newCaptureProgress;
            return "decayedPartially";
        }

        this.resetZoneCaptureUseCase.execute(zone);
        return "decayedToZero";
    }
}