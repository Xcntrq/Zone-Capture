export class Registry<TId, TItem> {
    private readonly items = new Map<TId, TItem>();

    public add(id: TId, item: TItem): void {
        if (this.items.has(id)) {
            throw new Error(`Duplicate id: "${id}"`);
        }

        this.items.set(id, item);
    }

    public remove(id: TId): void {
        if (!this.items.has(id)) {
            throw new Error(`Id not found: "${id}"`);
        }

        this.items.delete(id);
    }

    public has(id: TId): boolean {
        return this.items.has(id);
    }

    public get(id: TId): TItem | undefined {
        return this.items.get(id);
    }

    public values(): MapIterator<TItem> {
        return this.items.values();
    }
}