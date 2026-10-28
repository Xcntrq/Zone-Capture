import { type ITimeUser } from "./ITimeUser";

export interface ITimeUserRegistrar {
    registerTimeUser(timeUser: ITimeUser): void;
    unregisterTimeUser(timeUser: ITimeUser): void;
}