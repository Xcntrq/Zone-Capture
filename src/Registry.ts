export class Registry<TId, TItem> {
    private readonly _items = new Map<TId, TItem>();

    public readonly items: ReadonlyMap<TId, TItem> = this._items;

    public add(id: TId, item: TItem): void {
        if (this._items.has(id)) {
            throw new Error(`Duplicate id: ${id}`);
        }

        this._items.set(id, item);
    }

    public remove(id: TId): void {
        if (!this._items.has(id)) {
            throw new Error(`Id not found: ${id}`);
        }

        this._items.delete(id);
    }
}