import { type Zone } from "../Model/Zone";

export type UpdateZoneContestedFlagResult = "contestStarted" | "contestEnded" | "notChanged";

export class UpdateZoneContestedFlagUseCase {
    public execute(zone: Zone, factionCount: number): UpdateZoneContestedFlagResult {
        const wasContested = zone.isContested;
        const isContested = factionCount > 1;

        if (!wasContested && isContested) {
            zone.isContested = true;
            return "contestStarted";
        }

        if (wasContested && !isContested) {
            zone.isContested = false;
            return "contestEnded";
        }

        return "notChanged";
    }
}