import { type FunctionComponentElement, type ProviderProps, type PropsWithChildren } from "react";

interface Options {
  debounce?: boolean,
  events?: Record<string, Array<string>>
  modelTypes?: Record<string, object>,
  withRef?: boolean
}

export declare function connectBackboneToReact<Model extends {}, ModelProps extends {}>(
  mapModelToProps: (models: Model, props: ModelProps) => Partial<ModelProps>, options?: Options
): <CombinedProps>(
  wrappedComponent: React.ComponentType<CombinedProps>
) => React.ComponentType<Omit<CombinedProps, keyof ModelProps>>;


interface BackboneProviderProps<Models> {
  models: Models
}

export declare function BackboneProvider<Models extends {}>(props: PropsWithChildren<BackboneProviderProps<Models>>): FunctionComponentElement<ProviderProps<Models>>;
