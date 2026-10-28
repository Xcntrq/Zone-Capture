import { globalConfig } from "./globalConfig";
import { zonesConfig } from "./zonesConfig";
import { ManualTimeProvider } from "./ManualTimeProvider";
import { Registry } from "./Registry";
import { Faction } from "./Faction";
import { Zone } from "./Zone";
import { Player } from "./Player";

function main(): void {
    const timeProvider = new ManualTimeProvider(globalConfig.tickIntervalMs);

    const factionReg = new Registry<string, Faction>();
    for (const factionId of globalConfig.factionIds) {
        factionReg.add(factionId, new Faction(factionId));
    }

    const zoneReg = new Registry<string, Zone>();
    for (const zoneConfig of zonesConfig) {
        const ownerId = zoneConfig.initialOwningFactionId;
        if (ownerId !== null && !factionReg.has(ownerId)) {
            throw new Error(`Faction not found: "${ownerId}" for zone: "${zoneConfig.id}"`);
        }

        zoneReg.add(zoneConfig.id, new Zone(zoneConfig, globalConfig, timeProvider.nowMs));
    }

    const playerReg = new Registry<number, Player>();
    playerReg.add(1, new Player(1, "red", { x: 0, y: 0 }));
}

main();