export interface IGlobalConfig {
    readonly tickIntervalMs: number;
    readonly defaultZoneIncomeAmount: number;
    readonly defaultZoneIncomeIntervalMs: number;
    readonly defaultZoneCaptureThreshold: number;
    readonly defaultZoneCapturingPlayersLimit: number;
    readonly defaultZoneCaptureRatePerPlayerPerSecond: number;
    readonly defaultZoneCaptureDecayRatePerSecond: number;
    readonly factionIds: readonly string[];
}