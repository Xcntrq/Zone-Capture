import { describe, it, expect } from "vitest";
import { createTestSetup, AWAY } from "./testSetup";
import { type IZoneConfig } from "../src/IZoneConfig";

describe("edge cases", () => {
    it("the state is correct after player leaves the zone during capture", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(50);

        testSetup.playersAPI.setPlayerPosition(1, AWAY);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(48);
        expect(testSetup.getZoneState("field").isContested).toBe(false);
    });

    it("the state is correct after player is removed during capture", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(50);

        testSetup.playersAPI.removePlayer(1);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(48);
        expect(testSetup.getZoneState("field").isContested).toBe(false);
    });

    it("adding and removing players between ticks is processed correctly", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(10);

        testSetup.playersAPI.addPlayer(2, "blue", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTimeMs(25);
        testSetup.playersAPI.removePlayer(2);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(11);
        expect(testSetup.getZoneState("field").isContested).toBe(false);
        expect(testSetup.eventLog).toEqual([]);
    });

    it("1 player in 2 overlapping zones counts for both independently", () => {
        const zonesConfig: readonly IZoneConfig[] = [
            { id: "a", center: { x: 0, y: 0 }, radius: 50, initialOwningFactionId: null },
            { id: "b", center: { x: -20, y: 0 }, radius: 50, initialOwningFactionId: null },
        ];

        const testSetup = createTestSetup(zonesConfig);
        testSetup.playersAPI.addPlayer(1, "red", { x: -10, y: 0 });

        testSetup.manualTimeProvider.advanceTicks(99);
        expect(testSetup.getZoneState("a").owningFactionId).toBeNull();
        expect(testSetup.getZoneState("b").owningFactionId).toBeNull();
        expect(testSetup.getZoneState("a").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("b").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("a").captureProgress).toBeCloseTo(99);
        expect(testSetup.getZoneState("b").captureProgress).toBeCloseTo(99);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("a").owningFactionId).toBe("red");
        expect(testSetup.getZoneState("b").owningFactionId).toBe("red");
        expect(testSetup.getZoneState("a").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("b").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("a").captureProgress).toBe(0);
        expect(testSetup.getZoneState("b").captureProgress).toBe(0);
    });
});