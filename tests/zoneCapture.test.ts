import { describe, it, expect } from "vitest";
import { createTestSetup } from "./testSetup";

describe("zone capture", () => {
    it("1 player captures a neutral zone in exactly 100 ticks", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);

        testSetup.manualTimeProvider.advanceTicks(99);
        expect(testSetup.getZoneState("field").owningFactionId).toBeNull();
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(99);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").owningFactionId).toBe("red");
        expect(testSetup.getZoneState("field").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("field").captureProgress).toBe(0);
        expect(testSetup.eventLog).toEqual(["zoneOwnerChanged", "zoneCaptured"]);
    });

    it("2 players capture a neutral zone in exactly 50 ticks (twice as fast as one)", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.playersAPI.addPlayer(2, "red", testSetup.getZoneState("field").center);

        testSetup.manualTimeProvider.advanceTicks(49);
        expect(testSetup.getZoneState("field").owningFactionId).toBeNull();
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(98);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").owningFactionId).toBe("red");
        expect(testSetup.getZoneState("field").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("field").captureProgress).toBe(0);
        expect(testSetup.eventLog).toEqual(["zoneOwnerChanged", "zoneCaptured"]);
    });

    it("5 players capture a neutral zone in exactly 34 ticks (limited by 3 players)", () => {
        const testSetup = createTestSetup();

        for (let id = 1; id <= 5; id++) {
            testSetup.playersAPI.addPlayer(id, "red", testSetup.getZoneState("field").center);
        }

        testSetup.manualTimeProvider.advanceTicks(33);
        expect(testSetup.getZoneState("field").owningFactionId).toBeNull();
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(99);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").owningFactionId).toBe("red");
        expect(testSetup.getZoneState("field").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("field").captureProgress).toBe(0);
        expect(testSetup.eventLog).toEqual(["zoneOwnerChanged", "zoneCaptured"]);
    });

    it("zone ownership changes directly to another faction without becoming neutral", () => {
        const testSetup = createTestSetup();
        const owners: (string | null)[] = [];

        testSetup.zonesAPI.on("zoneOwnerChanged", e => {
            owners.push(e.fromFactionId, e.toFactionId);
        });

        testSetup.playersAPI.addPlayer(1, "blue", testSetup.getZoneState("docks").center);

        testSetup.manualTimeProvider.advanceTicks(99);
        expect(testSetup.getZoneState("docks").owningFactionId).toBe("red");

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("docks").owningFactionId).toBe("blue");
        expect(owners).toEqual(["red", "blue"]);
    });
});