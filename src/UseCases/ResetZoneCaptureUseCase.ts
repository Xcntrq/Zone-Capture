import { type Zone } from "../Model/Zone";

export type ResetZoneCaptureResult = "noCapturingFaction" | "reset";

export class ResetZoneCaptureUseCase {
    public execute(zone: Zone): ResetZoneCaptureResult {
        if (zone.capturingFactionId === null) {
            return "noCapturingFaction";
        }

        zone.capturingFactionId = null;
        zone.captureProgress = 0;
        return "reset";
    }
}