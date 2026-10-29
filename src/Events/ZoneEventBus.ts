import { type IZoneEvents, type ZoneEventName, type ZoneEventAction, type UnsubAction } from "./ZoneEvents";

type UnknownAction = (event: unknown) => void;

export class ZoneEventBus {
    private readonly actions = new Map<ZoneEventName, Set<UnknownAction>>();

    public on<TName extends ZoneEventName>(name: TName, action: ZoneEventAction<TName>): UnsubAction {
        const unknownAction = action as UnknownAction;

        let actions = this.actions.get(name);

        if (actions === undefined) {
            actions = new Set();
            this.actions.set(name, actions);
        }

        actions.add(unknownAction);

        return () => {
            this.actions.get(name)?.delete(unknownAction);
        };
    }

    public emit<TName extends ZoneEventName>(name: TName, event: IZoneEvents[TName]): void {
        const actions = this.actions.get(name);

        if (actions === undefined) {
            return;
        }

        for (const action of actions) {
            action(event);
        }
    }
}