export interface IZoneEvents {
    readonly zoneCaptured: IZoneCaptured;
    readonly zoneOwnerChanged: IZoneOwnerChanged;
    readonly zoneContestStarted: IZoneContestStarted;
    readonly zoneContestEnded: IZoneContestEnded;
    readonly zoneIncomePaid: IZoneIncomePaid;
}

export type ZoneEventName = keyof IZoneEvents;

export type ZoneEventAction<TName extends ZoneEventName> = (event: IZoneEvents[TName]) => void;

export type UnsubAction = () => void;

export interface IZoneCaptured {
    readonly zoneId: string;
    readonly fromFactionId: string | null;
    readonly toFactionId: string;
}

export interface IZoneOwnerChanged {
    readonly zoneId: string;
    readonly resultOf: "capture" | "apiCommand";
    readonly fromFactionId: string | null;
    readonly toFactionId: string | null;
}

export interface IZoneContestStarted {
    readonly zoneId: string;
}

export interface IZoneContestEnded {
    readonly zoneId: string;
}

export interface IZoneIncomePaid {
    readonly zoneId: string;
    readonly factionId: string;
    readonly paymentCount: number;
    readonly amountPerPayment: number;
}