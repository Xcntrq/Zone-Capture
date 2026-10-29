import { type PayZoneIncomeUseCase } from "./PayZoneIncomeUseCase";
import { type ITimeProvider } from "./ITimeProvider";
import { type ITimeUser } from "./ITimeUser";
import { type Registry } from "./Registry";
import { type Faction } from "./Faction";
import { type Zone } from "./Zone";

export class ZoneIncomePayingService implements ITimeUser {
    private readonly payZoneIncomeUseCase: PayZoneIncomeUseCase;
    private readonly factionReg: Registry<string, Faction>;
    private readonly zoneReg: Registry<string, Zone>;

    public constructor(payZoneIncomeUseCase: PayZoneIncomeUseCase, factionReg: Registry<string, Faction>, zoneReg: Registry<string, Zone>) {
        this.payZoneIncomeUseCase = payZoneIncomeUseCase;
        this.factionReg = factionReg;
        this.zoneReg = zoneReg;
    }

    public tick(timeProvider: ITimeProvider): void {
        for (const zone of this.zoneReg.items.values()) {
            if (zone.owningFactionId === null) {
                continue;
            }

            const factionId: string = zone.owningFactionId;
            const faction: Faction | undefined = this.factionReg.items.get(factionId);

            if (faction === undefined) {
                throw new Error(`Faction "${factionId}" not found for zone "${zone.id}"`);
            }

            this.payZoneIncomeUseCase.execute(zone, faction, timeProvider.nowMs);
        }
    }
}