import { type IVector2 } from "./IVector2";

export class Player {
    public readonly id: number;
    public readonly factionId: string | null;

    public position: IVector2;

    public constructor(id: number, factionId: string, pos: IVector2) {
        this.id = id;
        this.factionId = factionId;
        this.position = pos;
    }
}