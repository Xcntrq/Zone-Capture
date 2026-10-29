import { UpdateZoneContestedFlagUseCase } from "./UseCases/UpdateZoneContestedFlagUseCase";
import { AdvanceZoneCaptureUseCase } from "./UseCases/AdvanceZoneCaptureUseCase";
import { DecayZoneCaptureUseCase } from "./UseCases/DecayZoneCaptureUseCase";
import { ResetZoneCaptureUseCase } from "./UseCases/ResetZoneCaptureUseCase";
import { ZoneIncomePayingService } from "./Services/ZoneIncomePayingService";
import { PayZoneIncomeUseCase } from "./UseCases/PayZoneIncomeUseCase";
import { ZoneCapturingService } from "./Services/ZoneCapturingService";
import { SetZoneOwnerUseCase } from "./UseCases/SetZoneOwnerUseCase";
import { ManualTimeProvider } from "./Time/ManualTimeProvider";
import { globalConfig } from "./Configs/globalConfig";
import { type IZoneState } from "./Model/IZoneState";
import { ZoneEventBus } from "./Events/ZoneEventBus";
import { zonesConfig } from "./Configs/zonesConfig";
import { PlayersAPI } from "./API/PlayersAPI";
import { Registry } from "./Model/Registry";
import { ZonesAPI } from "./API/ZonesAPI";
import { Faction } from "./Model/Faction";
import { Player } from "./Model/Player";
import { Zone } from "./Model/Zone";

function main(): void {
    const logWithTimestamp = (message: string) => {
        const nowSec = (timeProvider.nowMs / 1000).toFixed(2);
        console.log(`[${nowSec} s] ${message}`);
    };

    const logZoneStates = () => {
        logWithTimestamp("Zone states:");
        console.table(zonesAPI.getZones().map((zone: IZoneState) => ({
            zone: zone.id,
            owner: zone.owningFactionId,
            capturingFaction: zone.capturingFactionId,
            captureProgress: zone.captureProgress.toFixed(2),
            contested: zone.isContested,
        })));
    };

    const logBalances = () => {
        logWithTimestamp("Balances:");
        console.table(Array.from(factionReg.values()).map((faction: Faction) => ({
            faction: faction.id,
            balance: faction.balance,
        })));
    };

    const timeProvider = new ManualTimeProvider(globalConfig.tickIntervalMs);

    // Players
    const playerReg = new Registry<number, Player>();

    // Factions
    const factionReg = new Registry<string, Faction>();
    for (const factionId of globalConfig.factionIds) {
        factionReg.add(factionId, new Faction(factionId));
    }

    // Zones
    const zoneReg = new Registry<string, Zone>();
    for (const zoneConfig of zonesConfig) {
        const ownerId = zoneConfig.initialOwningFactionId;
        if (ownerId !== null && !factionReg.has(ownerId)) {
            throw new Error(`Faction not found: "${ownerId}" for zone: "${zoneConfig.id}"`);
        }

        zoneReg.add(zoneConfig.id, new Zone(zoneConfig, globalConfig, timeProvider.nowMs));
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

    zonesAPI.on("zoneCaptured", e => {
        logWithTimestamp(`Zone "${e.zoneId}" captured by "${e.toFactionId}" from "${e.fromFactionId ?? "neutral"}".`);
    });

    zonesAPI.on("zoneOwnerChanged", e => {
        logWithTimestamp(`Zone "${e.zoneId}" owner changed to "${e.toFactionId}" from "${e.fromFactionId ?? "neutral"}" as a result of "${e.resultOf}".`);
    });

    zonesAPI.on("zoneContestStarted", e => {
        logWithTimestamp(`Zone "${e.zoneId}" contest started.`);
    });

    zonesAPI.on("zoneContestEnded", e => {
        logWithTimestamp(`Zone "${e.zoneId}" contest ended.`);
    });

    zonesAPI.on("zoneIncomePaid", e => {
        logWithTimestamp(`Zone "${e.zoneId}" gives income to "${e.factionId}": ${e.amountPerPayment.toFixed(2)} x ${e.paymentCount} time(s).`);
    });

    logZoneStates();

    playersAPI.addPlayer(1, "red", { x: 0, y: 0 });
    playersAPI.addPlayer(2, "red", { x: 0, y: 0 });
    playersAPI.addPlayer(3, "red", { x: 0, y: 0 });

    logWithTimestamp("3 reds entered the field. Capturing...");

    timeProvider.advanceTimeMs(20_000);

    logZoneStates();
    logBalances();

    playersAPI.addPlayer(4, "blue", { x: 0, y: 0 });

    logWithTimestamp("1 blue entered the field to contest!");

    timeProvider.advanceTimeMs(5_000);

    logZoneStates();
    logBalances();

    playersAPI.removePlayer(4);

    logWithTimestamp("Blue left the game. Reds are capturing...");

    timeProvider.advanceTimeMs(15_000);

    logZoneStates();
    logBalances();

    playersAPI.addPlayer(4, "blue", { x: -200, y: 0 });

    logWithTimestamp("1 blue entered the docks. Capturing...");

    timeProvider.advanceTimeMs(10_000);

    logZoneStates();
    logBalances();

    playersAPI.setPlayerPosition(4, { x: -1000, y: 0 });

    logWithTimestamp("Blue left the docks. Decaying...");

    timeProvider.advanceTimeMs(2_000);

    logZoneStates();

    zonesAPI.setOwner("docks", "green");

    logZoneStates();
    logBalances();
}

main();