import { type UpdateZoneContestedFlagUseCase } from "./UpdateZoneContestedFlagUseCase";
import { type AdvanceZoneCaptureUseCase } from "./AdvanceZoneCaptureUseCase";
import { type DecayZoneCaptureUseCase } from "./DecayZoneCaptureUseCase";
import { type ResetZoneCaptureUseCase } from "./ResetZoneCaptureUseCase";
import { type ITimeProvider } from "./ITimeProvider";
import { type ZoneEventBus } from "./ZoneEventBus";
import { type ITimeUser } from "./ITimeUser";
import { type Registry } from "./Registry";
import { type Player } from "./Player";
import { type Zone } from "./Zone";

export class ZoneCapturingService implements ITimeUser {
    private readonly zoneEventBus: ZoneEventBus;
    private readonly zoneReg: Registry<string, Zone>;
    private readonly playerReg: Registry<number, Player>;
    private readonly resetZoneCaptureUseCase: ResetZoneCaptureUseCase;
    private readonly decayZoneCaptureUseCase: DecayZoneCaptureUseCase;
    private readonly advanceZoneCaptureUseCase: AdvanceZoneCaptureUseCase;
    private readonly updateZoneContestedFlagUseCase: UpdateZoneContestedFlagUseCase;
    private readonly factionToPlayerCount = new Map<string, number>();

    public constructor(
        zoneEventBus: ZoneEventBus,
        zoneReg: Registry<string, Zone>,
        playerReg: Registry<number, Player>,
        resetZoneCaptureUseCase: ResetZoneCaptureUseCase,
        decayZoneCaptureUseCase: DecayZoneCaptureUseCase,
        advanceZoneCaptureUseCase: AdvanceZoneCaptureUseCase,
        updateZoneContestedFlagUseCase: UpdateZoneContestedFlagUseCase
    ) {
        this.zoneEventBus = zoneEventBus;
        this.zoneReg = zoneReg;
        this.playerReg = playerReg;
        this.resetZoneCaptureUseCase = resetZoneCaptureUseCase;
        this.decayZoneCaptureUseCase = decayZoneCaptureUseCase;
        this.advanceZoneCaptureUseCase = advanceZoneCaptureUseCase;
        this.updateZoneContestedFlagUseCase = updateZoneContestedFlagUseCase;
    }

    public tick(timeProvider: ITimeProvider): void {
        const dtSec = timeProvider.tickIntervalMs / 1000;

        for (const zone of this.zoneReg.values()) {
            this.factionToPlayerCount.clear();

            for (const player of this.playerReg.values()) {
                if (zone.containsPoint(player.position)) {
                    const playerCount = this.factionToPlayerCount.get(player.factionId) ?? 0;
                    this.factionToPlayerCount.set(player.factionId, playerCount + 1);
                }
            }

            const zoneId = zone.id;
            const factionCount = this.factionToPlayerCount.size;
            const contestResult = this.updateZoneContestedFlagUseCase.execute(zone, factionCount);

            if (contestResult === "contestStarted") {
                this.zoneEventBus.emit("zoneContestStarted", { zoneId });
            } else if (contestResult === "contestEnded") {
                this.zoneEventBus.emit("zoneContestEnded", { zoneId });
            }

            if (zone.isContested) {
                continue;
            }

            if (factionCount === 0) {
                this.decayZoneCaptureUseCase.execute(zone, dtSec);
                continue;
            }

            // There is only one faction in the zone
            for (const [factionId, playerCount] of this.factionToPlayerCount) {
                if (factionId === zone.owningFactionId) {
                    this.resetZoneCaptureUseCase.execute(zone);
                    continue;
                }

                const fromFactionId = zone.owningFactionId;
                const captureResult = this.advanceZoneCaptureUseCase.execute(zone, factionId, playerCount, dtSec, timeProvider.nowMs);

                if (captureResult === "fullyCaptured") {
                    const toFactionId = factionId;
                    this.zoneEventBus.emit("zoneOwnerChanged", { zoneId, resultOf: "capture", fromFactionId, toFactionId });
                    this.zoneEventBus.emit("zoneCaptured", { zoneId, fromFactionId, toFactionId });
                }
            }
        }
    }
}