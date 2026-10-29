import { type IVector2 } from "../Model/IVector2";
import { type Registry } from "../Model/Registry";
import { type Faction } from "../Model/Faction";
import { Player } from "../Model/Player";

export class PlayersAPI {
    private readonly playerReg: Registry<number, Player>;
    private readonly factionReg: Registry<string, Faction>;

    public constructor(playerReg: Registry<number, Player>, factionReg: Registry<string, Faction>) {
        this.playerReg = playerReg;
        this.factionReg = factionReg;
    }

    public addPlayer(playerId: number, factionId: string, position: IVector2): void {
        if (!this.factionReg.has(factionId)) {
            throw new Error(`Faction "${factionId}" not found`);
        }

        const player = new Player(playerId, factionId, position);
        this.playerReg.add(playerId, player);
    }

    public removePlayer(playerId: number): void {
        this.playerReg.remove(playerId);
    }

    public setPlayerPosition(playerId: number, position: IVector2): void {
        const player = this.playerReg.get(playerId);

        if (player === undefined) {
            throw new Error(`Player "${playerId}" not found`);
        }

        player.position = position;
    }
}