import { type Component, type ReactElement, type FunctionComponentElement, type ProviderProps, type FC, type PropsWithChildren } from "react";

type Models = Record<string, object>

type MapModelToProps<M extends Models, P extends object> = (models: M, props: P) => Partial<P>;

interface Options {
  debounce?: boolean,
  events?: Record<string, Array<string>>
  modelTypes?: Models,
  withRef?: boolean
}

export declare function connectBackboneToReact<M extends Models = Models, P extends object = {}>(mapModelToProps: MapModelToProps<M, P>, options?: Options): (component: FC<P> | Component<P>) => (subcomponent: Partial<P>) => JSX.Element

interface BackboneProviderProps<M> {
  children: ReactElement
  models: M
}

// do we need generics here?
export declare function BackboneProvider<M extends Models>(props: BackboneProviderProps<M>): FunctionComponentElement<ProviderProps<M>>;
