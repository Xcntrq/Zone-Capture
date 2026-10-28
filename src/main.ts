import { globalConfig } from "./globalConfig";
import { zonesConfig } from "./zonesConfig";
import { Player } from "./Player";
import { Zone } from "./Zone";

const p1: Player = new Player(1, "red", { x: 0, y: 0 });

console.log(p1);

const zones: Zone[] = [];
for (const zoneConfig of zonesConfig) {
    zones.push(new Zone(zoneConfig, globalConfig));
}

console.log(zones);