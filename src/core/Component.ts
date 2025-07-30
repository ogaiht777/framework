
/**
 * A marker interface for Components.
 * Components should be simple data containers with no logic.
 */
export interface Component {}

/**
 * A unique identifier for a component type.
 * Using numbers for performance instead of strings.
 */
export type ComponentType = number;

let nextComponentType: ComponentType = 0;

/**
 * A map to store the assigned type ID for each component constructor.
 * This prevents re-registering the same component and ensures a consistent ID.
 * We use a WeakMap to avoid memory leaks if a component class is no longer referenced.
 */
const componentTypeMap = new WeakMap<Function, ComponentType>();
const componentTypeToNameMap = new Map<ComponentType, string>();

/**
 * Gets the unique type ID for a given Component class.
 * If the component has not been registered yet, it assigns a new ID.
 * This is a core function for the ECS, allowing for fast lookups.
 * @param componentClass The component class (e.g., PositionComponent).
 * @returns The unique numeric ID for that component type.
 */
export function getComponentType<T extends Component>(componentClass: { new(...args: any[]): T }): ComponentType {
    if (componentTypeMap.has(componentClass)) {
        return componentTypeMap.get(componentClass)!;
    }

    const typeId = nextComponentType++;
    componentTypeMap.set(componentClass, typeId);
    componentTypeToNameMap.set(typeId, componentClass.name);
    return typeId;
}

/**
 * Gets the name of a component class from its type ID.
 * Useful for debugging and logging.
 * @param typeId The unique numeric ID for the component type.
 * @returns The name of the component class, or 'UnknownComponent' if not found.
 */
export function getComponentName(typeId: ComponentType): string {
    return componentTypeToNameMap.get(typeId) || 'UnknownComponent';
}
