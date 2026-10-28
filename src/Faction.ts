export class Faction {
    private _balance: number = 0;

    public readonly id: string;

    public constructor(id: string) {
        this.id = id;
    }

    public get balance(): number {
        return this._balance;
    }

    public addIncome(amount: number): void {
        if (!Number.isSafeInteger(amount) || amount < 0) {
            throw new Error(`Invalid amount: ${amount} (must be a non-negative safe integer)`);
        }

        if (!Number.isSafeInteger(this._balance + amount)) {
            throw new Error(`Balance overflow: ${this._balance} + ${amount}`);
        }

        this._balance += amount;
    }
}