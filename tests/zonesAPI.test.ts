import { describe, it, expect } from "vitest";
import { createTestSetup } from "./testSetup";

describe("zones API", () => {
    it("setOwner command resets capture and fires an event", () => {
        const testSetup = createTestSetup();
        const causes: string[] = [];
        testSetup.zonesAPI.on("zoneOwnerChanged", e => {
            causes.push(e.resultOf);
        });

        testSetup.playersAPI.addPlayer(1, "blue", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(30);

        testSetup.zonesAPI.setOwner("field", "green");
        expect(testSetup.getZoneState("field").owningFactionId).toBe("green");
        expect(testSetup.getZoneState("field").capturingFactionId).toBeNull();
        expect(testSetup.getZoneState("field").captureProgress).toBe(0);
        expect(testSetup.getZoneState("field").isContested).toBe(false);
        expect(testSetup.eventLog).toEqual(["zoneOwnerChanged"]);
        expect(causes).toEqual(["apiCommand"]);
    });

    it("setOwner is ignored for the same owner", () => {
        const testSetup = createTestSetup();
        testSetup.zonesAPI.setOwner("docks", "red");
        expect(testSetup.eventLog).toEqual([]);
    });

    it("getZone returns null for wrong zone id", () => {
        const testSetup = createTestSetup();
        expect(testSetup.zonesAPI.getZone("gazorpazorp")).toBeNull();
    });

    it("invalid setOwner arguments throw", () => {
        const testSetup = createTestSetup();
        expect(() => testSetup.zonesAPI.setOwner("field", "cyan")).toThrow();
        expect(() => testSetup.zonesAPI.setOwner("gazorpazorp", "red")).toThrow();
    });

    it("changing zones does not change previous snapshots", () => {
        const testSetup = createTestSetup();
        const before = testSetup.zonesAPI.getZones();
        testSetup.zonesAPI.setOwner("field", "green");
        const after = testSetup.zonesAPI.getZones();

        expect(before.find(zone => zone.id === "field")?.owningFactionId).toBeNull();
        expect(after.find(zone => zone.id === "field")?.owningFactionId).toBe("green");
    });
});