// for internal purposes only

export function hasProperty<Property extends PropertyKey>(
    obj: unknown,
    prop: Property
): obj is Record<Property, unknown> {
    return typeof obj === 'object' && obj !== null && prop in obj;
}
