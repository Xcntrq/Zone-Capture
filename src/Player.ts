import { type IVector2, isVectorFinite } from "./IVector2";

export class Player {
    private static validatePosition(pos: IVector2): IVector2 {
        if (!isVectorFinite(pos)) {
            throw new Error(`Invalid position: "${pos.x},${pos.y}" is not finite`);
        }

        return pos;
    }

    public readonly id: number;
    public readonly factionId: string;

    private _position: IVector2;

    public get position(): IVector2 {
        return this._position;
    }

    public set position(value: IVector2) {
        this._position = Player.validatePosition(value);
    }

    public constructor(id: number, factionId: string, pos: IVector2) {
        this.id = id;
        this.factionId = factionId;
        this._position = Player.validatePosition(pos);
    }
}