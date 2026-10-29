import { type IGlobalConfig } from "./IGlobalConfig";

export const globalConfig: IGlobalConfig = {
    tickIntervalMs: 50,
    defaultZoneIncomeAmount: 100,
    defaultZoneIncomeIntervalMs: 5_000,
    defaultZoneCaptureThreshold: 100,
    defaultZoneCapturingPlayersLimit: 10,
    defaultZoneCaptureRatePerPlayerPerSecond: 1,
    defaultZoneCaptureDecayRatePerSecond: 20,
    factionIds: [
        "red",
        "green",
        "blue",
    ],
};