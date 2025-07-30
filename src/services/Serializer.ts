
/**
 * Defines the contract for a data serializer.
 * Any class implementing this interface can be used to convert data for network transmission or storage.
 */
export interface ISerializer {
    /**
     * Serializes data into a format suitable for transmission or storage.
     * @param data The data to serialize.
     * @returns The serialized data.
     */
    serialize(data: any): any;

    /**
     * Deserializes data from a transmission or storage format back into its original form.
     * @param data The data to deserialize.
     * @returns The deserialized data.
     */
    deserialize(data: any): any;
}

/**
 * A basic serializer that uses JSON.stringify and JSON.parse.
 * This is a default implementation and can be replaced with more optimized serializers (e.g., MessagePack) later.
 */
export class JsonSerializer implements ISerializer {
    serialize(data: any): string {
        return JSON.stringify(data);
    }

    deserialize(data: string): any {
        return JSON.parse(data);
    }
}
