import { describe, it, expect } from "vitest";
import { createTestSetup } from "./testSetup";

describe("income", () => {
    it("income is paid once per interval and only to the zone owner", () => {
        const testSetup = createTestSetup();
        testSetup.manualTimeProvider.advanceTicks(9);
        expect(testSetup.getFactionBalance("red")).toBe(0);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(testSetup.getFactionBalance("red")).toBe(10);

        testSetup.manualTimeProvider.advanceTicks(20);
        expect(testSetup.getFactionBalance("red")).toBe(30);
        expect(testSetup.getFactionBalance("blue")).toBe(0);
        expect(testSetup.getFactionBalance("green")).toBe(0);
    });

    it("income timer resets when the zone is captured", () => {
        const testSetup = createTestSetup();
        const incomeTimestamps: number[] = [];
        testSetup.zonesAPI.on("zoneIncomePaid", e => {
            if (e.zoneId === "field") {
                incomeTimestamps.push(testSetup.manualTimeProvider.nowMs);
            }
        });

        testSetup.manualTimeProvider.advanceTicks(50);
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("field").center);
        testSetup.manualTimeProvider.advanceTicks(100);

        testSetup.manualTimeProvider.advanceTicks(9);
        expect(incomeTimestamps).toEqual([]);

        testSetup.manualTimeProvider.advanceTicks(1);
        expect(incomeTimestamps).toEqual([16_000]);
    });

    it("income is paid to the owner during zone contest", () => {
        const testSetup = createTestSetup();
        testSetup.playersAPI.addPlayer(1, "red", testSetup.getZoneState("docks").center);
        testSetup.playersAPI.addPlayer(2, "blue", testSetup.getZoneState("docks").center);

        testSetup.manualTimeProvider.advanceTicks(10);
        expect(testSetup.getZoneState("docks").isContested).toBe(true);
        expect(testSetup.getFactionBalance("red")).toBe(10);
    });
});