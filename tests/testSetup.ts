import { UpdateZoneContestedFlagUseCase } from "../src/UseCases/UpdateZoneContestedFlagUseCase";
import { AdvanceZoneCaptureUseCase } from "../src/UseCases/AdvanceZoneCaptureUseCase";
import { DecayZoneCaptureUseCase } from "../src/UseCases/DecayZoneCaptureUseCase";
import { ResetZoneCaptureUseCase } from "../src/UseCases/ResetZoneCaptureUseCase";
import { ZoneIncomePayingService } from "../src/Services/ZoneIncomePayingService";
import { PayZoneIncomeUseCase } from "../src/UseCases/PayZoneIncomeUseCase";
import { ZoneCapturingService } from "../src/Services/ZoneCapturingService";
import { SetZoneOwnerUseCase } from "../src/UseCases/SetZoneOwnerUseCase";
import { ManualTimeProvider } from "../src/Time/ManualTimeProvider";
import { type IGlobalConfig } from "../src/Configs/IGlobalConfig";
import { type ZoneEventName } from "../src/Events/ZoneEvents";
import { type IZoneConfig } from "../src/Configs/IZoneConfig";
import { type IZoneState } from "../src/Model/IZoneState";
import { ZoneEventBus } from "../src/Events/ZoneEventBus";
import { type IVector2 } from "../src/Model/IVector2";
import { PlayersAPI } from "../src/API/PlayersAPI";
import { Registry } from "../src/Model/Registry";
import { ZonesAPI } from "../src/API/ZonesAPI";
import { Faction } from "../src/Model/Faction";
import { Player } from "../src/Model/Player";
import { Zone } from "../src/Model/Zone";

const globalTestConfig: IGlobalConfig = {
    tickIntervalMs: 100,
    defaultZoneIncomeAmount: 10,
    defaultZoneIncomeIntervalMs: 1_000,
    defaultZoneCaptureThreshold: 100,
    defaultZoneCapturingPlayersLimit: 3,
    defaultZoneCaptureRatePerPlayerPerSecond: 10,
    defaultZoneCaptureDecayRatePerSecond: 20,
    factionIds: ["red", "green", "blue"],
};

const zonesTestConfig: readonly IZoneConfig[] = [
    { id: "field", center: { x: 0, y: 0 }, radius: 50, initialOwningFactionId: null },
    { id: "docks", center: { x: -200, y: 0 }, radius: 50, initialOwningFactionId: "red" },
];

interface ITestSetup {
    readonly manualTimeProvider: ManualTimeProvider;
    readonly playersAPI: PlayersAPI;
    readonly zonesAPI: ZonesAPI;
    readonly eventLog: readonly ZoneEventName[];

    getZoneState(zoneId: string): IZoneState;
    getFactionBalance(factionId: string): number | undefined;
}

export const AWAY: IVector2 = { x: 200, y: 0 };

export function createTestSetup(zonesConfig: readonly IZoneConfig[] = zonesTestConfig): ITestSetup {
    const timeProvider = new ManualTimeProvider(globalTestConfig.tickIntervalMs);

    // Players
    const playerReg = new Registry<number, Player>();

    // Factions
    const factionReg = new Registry<string, Faction>();
    for (const factionId of globalTestConfig.factionIds) {
        factionReg.add(factionId, new Faction(factionId));
    }

    // Zones
    const zoneReg = new Registry<string, Zone>();
    for (const zoneConfig of zonesConfig) {
        const ownerId = zoneConfig.initialOwningFactionId;
        if (ownerId !== null && !factionReg.has(ownerId)) {
            throw new Error(`Faction not found: "${ownerId}" for zone: "${zoneConfig.id}"`);
        }

        zoneReg.add(zoneConfig.id, new Zone(zoneConfig, globalTestConfig, timeProvider.nowMs));
    }

    // Use cases
    const payZoneIncomeUseCase = new PayZoneIncomeUseCase();
    const resetZoneCaptureUseCase = new ResetZoneCaptureUseCase();
    const updateZoneContestedFlagUseCase = new UpdateZoneContestedFlagUseCase();
    const setZoneOwnerUseCase = new SetZoneOwnerUseCase(resetZoneCaptureUseCase);
    const decayZoneCaptureUseCase = new DecayZoneCaptureUseCase(resetZoneCaptureUseCase);
    const advanceZoneCaptureUseCase = new AdvanceZoneCaptureUseCase(resetZoneCaptureUseCase, setZoneOwnerUseCase);

    // Event bus(es)
    const zoneEventBus = new ZoneEventBus();

    // Services
    const zoneIncomePayingService = new ZoneIncomePayingService(payZoneIncomeUseCase, factionReg, zoneReg, zoneEventBus);
    const zoneCapturingService = new ZoneCapturingService(zoneEventBus, zoneReg, playerReg, resetZoneCaptureUseCase, decayZoneCaptureUseCase, advanceZoneCaptureUseCase, updateZoneContestedFlagUseCase);

    timeProvider.registerTimeUser(zoneIncomePayingService);
    timeProvider.registerTimeUser(zoneCapturingService);

    // APIs
    const zonesAPI = new ZonesAPI(zoneReg, factionReg, setZoneOwnerUseCase, timeProvider, zoneEventBus);
    const playersAPI = new PlayersAPI(playerReg, factionReg);

    const eventLog: ZoneEventName[] = [];
    zonesAPI.on("zoneCaptured", () => { eventLog.push("zoneCaptured"); });
    zonesAPI.on("zoneOwnerChanged", () => { eventLog.push("zoneOwnerChanged"); });
    zonesAPI.on("zoneContestStarted", () => { eventLog.push("zoneContestStarted"); });
    zonesAPI.on("zoneContestEnded", () => { eventLog.push("zoneContestEnded"); });

    return {
        manualTimeProvider: timeProvider,
        playersAPI,
        zonesAPI,
        eventLog,

        getZoneState: (zoneId: string) => {
            const zoneState = zonesAPI.getZone(zoneId);
            if (zoneState === null) {
                throw new Error(`Zone "${zoneId}" not found`);
            }

            return zoneState;
        },

        getFactionBalance: (factionId: string) => {
            return factionReg.get(factionId)?.balance;
        },
    };
}