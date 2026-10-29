import { type ZoneEventName, type ZoneEventAction, type UnsubAction } from "../Events/ZoneEvents";
import { type SetZoneOwnerUseCase } from "../UseCases/SetZoneOwnerUseCase";
import { type ITimeProvider } from "../Time/ITimeProvider";
import { type ZoneEventBus } from "../Events/ZoneEventBus";
import { type IZoneState } from "../Model/IZoneState";
import { type Registry } from "../Model/Registry";
import { type Faction } from "../Model/Faction";
import { type Zone } from "../Model/Zone";

export class ZonesAPI {
    private readonly zoneReg: Registry<string, Zone>;
    private readonly factionReg: Registry<string, Faction>;
    private readonly setZoneOwnerUseCase: SetZoneOwnerUseCase;
    private readonly timeProvider: ITimeProvider;
    private readonly zoneEventBus: ZoneEventBus;

    public constructor(
        zoneReg: Registry<string, Zone>,
        factionReg: Registry<string, Faction>,
        setZoneOwnerUseCase: SetZoneOwnerUseCase,
        timeProvider: ITimeProvider,
        zoneEventBus: ZoneEventBus
    ) {
        this.zoneReg = zoneReg;
        this.factionReg = factionReg;
        this.setZoneOwnerUseCase = setZoneOwnerUseCase;
        this.timeProvider = timeProvider;
        this.zoneEventBus = zoneEventBus;
    }

    public getZones(): IZoneState[] {
        return Array.from(this.zoneReg.values(), zone => zone.toState());
    }

    public getZone(zoneId: string): IZoneState | null {
        return this.zoneReg.get(zoneId)?.toState() ?? null;
    }

    public setOwner(zoneId: string, factionId: string): void {
        const zone = this.zoneReg.get(zoneId);

        if (zone === undefined) {
            throw new Error(`Zone "${zoneId}" not found`);
        }

        if (!this.factionReg.has(factionId)) {
            throw new Error(`Faction "${factionId}" not found`);
        }

        if (factionId !== zone.owningFactionId) {
            const toFactionId = factionId;
            const fromFactionId = zone.owningFactionId;
            this.setZoneOwnerUseCase.execute(zone, factionId, this.timeProvider.nowMs);
            this.zoneEventBus.emit("zoneOwnerChanged", { zoneId, resultOf: "apiCommand", fromFactionId, toFactionId });
        }
    }

    public on<TName extends ZoneEventName>(name: TName, action: ZoneEventAction<TName>): UnsubAction {
        return this.zoneEventBus.on(name, action);
    }
}