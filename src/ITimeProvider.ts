export interface ITimeProvider {
    readonly nowMs: number;
    readonly tickIntervalMs: number;
}