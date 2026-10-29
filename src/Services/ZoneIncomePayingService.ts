import { type PayZoneIncomeUseCase } from "../UseCases/PayZoneIncomeUseCase";
import { type ITimeProvider } from "../Time/ITimeProvider";
import { type ZoneEventBus } from "../Events/ZoneEventBus";
import { type ITimeUser } from "../Time/ITimeUser";
import { type Registry } from "../Model/Registry";
import { type Faction } from "../Model/Faction";
import { type Zone } from "../Model/Zone";

export class ZoneIncomePayingService implements ITimeUser {
    private readonly payZoneIncomeUseCase: PayZoneIncomeUseCase;
    private readonly factionReg: Registry<string, Faction>;
    private readonly zoneReg: Registry<string, Zone>;
    private readonly zoneEventBus: ZoneEventBus;

    public constructor(
        payZoneIncomeUseCase: PayZoneIncomeUseCase,
        factionReg: Registry<string, Faction>,
        zoneReg: Registry<string, Zone>,
        zoneEventBus: ZoneEventBus
    ) {
        this.payZoneIncomeUseCase = payZoneIncomeUseCase;
        this.factionReg = factionReg;
        this.zoneReg = zoneReg;
        this.zoneEventBus = zoneEventBus;
    }

    public tick(timeProvider: ITimeProvider): void {
        for (const zone of this.zoneReg.values()) {
            if (zone.owningFactionId === null) {
                continue;
            }

            const zoneId = zone.id;
            const factionId: string = zone.owningFactionId;
            const faction: Faction | undefined = this.factionReg.get(factionId);

            if (faction === undefined) {
                throw new Error(`Faction "${factionId}" not found for zone "${zoneId}"`);
            }

            const paymentCount = this.payZoneIncomeUseCase.execute(zone, faction, timeProvider.nowMs);

            if (paymentCount > 0) {
                const amountPerPayment = zone.incomeAmount;
                this.zoneEventBus.emit("zoneIncomePaid", { zoneId, factionId, paymentCount, amountPerPayment });
            }
        }
    }
}