import { type IZoneConfig } from "./IZoneConfig";

export const zonesConfig: readonly IZoneConfig[] = [
    {
        id: "field",
        center: { x: 0, y: 0 },
        radius: 50,
        initialOwningFactionId: null,
    },
    {
        id: "docks",
        center: { x: -200, y: 0 },
        radius: 50,
        initialOwningFactionId: "red",
    },
    {
        id: "factory",
        center: { x: 200, y: 0 },
        radius: 50,
        initialOwningFactionId: "blue",
        incomeAmount: 50,
        incomeIntervalMs: 10_000,
    },
];