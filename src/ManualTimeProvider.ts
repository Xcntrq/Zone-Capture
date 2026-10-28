import { type ITimeUser } from "./ITimeUser";
import { type ITimeProvider } from "./ITimeProvider";
import { type ITimeUserRegistrar } from "./ITimeUserRegistrar";

export class ManualTimeProvider implements ITimeProvider, ITimeUserRegistrar {
    private readonly timeUsers = new Set<ITimeUser>();
    private readonly startTimeMs: number;

    private tickCount: number;
    private accumulatedMs: number = 0;

    public readonly tickIntervalMs: number;

    public constructor(tickIntervalMs: number, startTimeMs: number = 0) {
        if (!Number.isSafeInteger(tickIntervalMs) || tickIntervalMs <= 0) {
            throw new Error(`Invalid tick interval: ${tickIntervalMs} (must be a positive safe integer)`);
        }

        if (!Number.isSafeInteger(startTimeMs) || startTimeMs < 0) {
            throw new Error(`Invalid start time: ${startTimeMs} (must be a non-negative safe integer)`);
        }

        this.tickIntervalMs = tickIntervalMs;
        this.startTimeMs = startTimeMs;
        this.tickCount = 0;
    }

    public get nowMs(): number {
        return this.startTimeMs + this.tickCount * this.tickIntervalMs;
    }

    public registerTimeUser(timeUser: ITimeUser): void {
        this.timeUsers.add(timeUser);
    }

    public unregisterTimeUser(timeUser: ITimeUser): void {
        this.timeUsers.delete(timeUser);
    }

    public advanceTimeMs(dtMs: number): void {
        if (!Number.isFinite(dtMs) || dtMs < 0) {
            throw new Error(`Invalid dt: ${dtMs} (must be a non-negative finite number)`);
        }

        this.accumulatedMs += dtMs;
        while (this.accumulatedMs >= this.tickIntervalMs) {
            this.tick();
            this.accumulatedMs -= this.tickIntervalMs;
        }
    }

    public advanceTicks(tickCount: number): void {
        if (!Number.isSafeInteger(tickCount) || tickCount < 0) {
            throw new Error(`Invalid tick count: ${tickCount} (must be a non-negative safe integer)`);
        }

        for (let i = 0; i < tickCount; i++) {
            this.tick();
        }
    }

    private tick(): void {
        this.tickCount++;
        for (const timeUser of this.timeUsers) {
            timeUser.tick(this);
        }
    }
}