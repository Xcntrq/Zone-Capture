import { type ITimeProvider } from "./ITimeProvider";

export interface ITimeUser {
    tick(timeProvider: ITimeProvider): void;
}