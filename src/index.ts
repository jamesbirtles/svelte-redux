import { Store, Unsubscribe, Dispatch, ActionCreator, bindActionCreators } from 'redux';

type Component = any;

interface SvelteStore {
    [index: string]: any;

    _unsub?: Unsubscribe;
    _init(): object;
    _add(component: Component, keys: string[]): void;
    _remove(component: Component): void;
}

export type MapState<S> = (state: S) => { [key: string]: any };
export type MapDispatch<S> = (
    dispatch: Dispatch<S>,
) => { [key: string]: (...args: any[]) => void } | { [key: string]: ActionCreator<any> };

export function connect<S>(
    store: Store<S>,
    mapStateToData: MapState<S>,
    mapDispatchToStore?: MapDispatch<S>,
) {
    function mapStateToData$(state: S) {
        const mapped = mapStateToData(state);
        return Object.keys(mapped).reduce(
            (data, key) => ({ ...data, ['$' + key]: mapped[key] }),
            {},
        );
    }

    return () => {
        if (store == null) {
            return { _init: () => ({}) };
        }

        const svelteStore: SvelteStore = {
            _init() {
                return mapStateToData$(store.getState());
            },

            _add(component: Component, keys: string[]) {
                svelteStore._unsub = store.subscribe(() => {
                    component.set(mapStateToData$(store.getState()));
                });
            },

            _remove(component: Component) {
                if (svelteStore._unsub != null) {
                    svelteStore._unsub();
                }
            },
        };

        if (mapDispatchToStore == null) {
            Object.assign(svelteStore, { dispatch: store.dispatch });
        } else if (typeof mapDispatchToStore === 'function') {
            Object.assign(svelteStore, mapDispatchToStore(store.dispatch));
        } else {
            Object.assign(svelteStore, bindActionCreators(mapDispatchToStore, store.dispatch));
        }

        return svelteStore;
    };
}

export function bindConnect<S>(
    store: Store<S>,
): (mapStateToData: MapState<S>, mapDispatchToStore?: MapDispatch<S>) => any {
    return connect.bind(null, store);
}
