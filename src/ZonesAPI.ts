import { type ZoneEventName, type ZoneEventAction, type UnsubAction } from "./ZoneEvents";
import { type SetZoneOwnerUseCase } from "./SetZoneOwnerUseCase";
import { type ITimeProvider } from "./ITimeProvider";
import { type ZoneEventBus } from "./ZoneEventBus";
import { type IZoneState } from "./IZoneState";
import { type Registry } from "./Registry";
import { type Faction } from "./Faction";
import { type Zone } from "./Zone";

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