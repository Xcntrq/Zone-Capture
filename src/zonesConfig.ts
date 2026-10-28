import { type IZoneConfig } from "./IZoneConfig";

export const zonesConfig: readonly IZoneConfig[] = [
    {
        id: "field",
        center: { x: 0, y: 0 },
        radius: 100,
        initialOwningFactionId: null,
    },
    {
        id: "docks",
        center: { x: -100, y: 0 },
        radius: 100,
        initialOwningFactionId: "red",
    },
    {
        id: "factory",
        center: { x: 100, y: 0 },
        radius: 100,
        initialOwningFactionId: "blue",
        incomeAmount: 50,
        incomeIntervalMs: 1_000,
    },
];