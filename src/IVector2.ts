export interface IVector2 {
    readonly x: number;
    readonly y: number;
}

export function distSqr(a: IVector2, b: IVector2): number {
    const dx: number = a.x - b.x;
    const dy: number = a.y - b.y;
    return dx * dx + dy * dy;
}