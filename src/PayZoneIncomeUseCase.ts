import { type Faction } from "./Faction";
import { type Zone } from "./Zone";

export class PayZoneIncomeUseCase {
    public execute(zone: Zone, faction: Faction, nowMs: number): number {
        let paymentCount: number = 0;

        while (nowMs >= zone.nextIncomeAt) {
            faction.addIncome(zone.incomeAmount);
            zone.nextIncomeAt += zone.incomeIntervalMs;
            paymentCount++;
        }

        return paymentCount;
    }
}