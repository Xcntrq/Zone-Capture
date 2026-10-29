import { describe, it, expect } from "vitest";
import { createTestSetup } from "./testSetup";

describe("zone contest", () => {
    it("2 factions in 1 zone freeze progress and cause contest events", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(30);

        testSetup.playersAPI.addPlayer(2, "blue", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(20);
        expect(testSetup.getZoneState("field").isContested).toBe(true);
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(30);
        expect(testSetup.eventLog).toEqual(["zoneContestStarted"]);

        testSetup.playersAPI.removePlayer(2);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").isContested).toBe(false);
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(31);
        expect(testSetup.eventLog).toEqual(["zoneContestStarted", "zoneContestEnded"]);
    });

    it("zone owner alone in their zone resets capture progress instantly", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "blue", testSetup.getZoneState("docks").center);
        testSetup.manualTimeProvider.advanceTicks(30);
        expect(testSetup.getZoneState("docks").capturingFactionId).toBe("blue");
        expect(testSetup.getZoneState("docks").captureProgress).toBeCloseTo(30);

        testSetup.playersAPI.removePlayer(1);
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("docks").center);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("docks").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("docks").captureProgress).toBe(0);
    });

    it("new capturing faction alone in the zone resets previous capture progress and starts from zero", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(30);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(30);

        testSetup.playersAPI.removePlayer(1);
        testSetup.playersAPI.addPlayer(1, "blue", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("blue");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(1);
    });

    it("progress gradually decays in empty zone and capturing faction is null at zero", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(30);
        testSetup.playersAPI.removePlayer(1);

        testSetup.manualTimeProvider.advanceTicks(14);
        expect(testSetup.getZoneState("field").capturingFactionId).toBe("red");
        expect(testSetup.getZoneState("field").captureProgress).toBeCloseTo(2);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getZoneState("field").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("field").captureProgress).toBe(0);
    });
});