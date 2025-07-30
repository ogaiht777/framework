
import { Component } from '../Component';

/**
 * A component that marks an entity as network-aware.
 * It holds data necessary for synchronizing the entity's state across the network.
 */
export class NetworkComponent implements Component {
    /**
     * The unique network identifier for this entity.
     * This could be a FiveM network ID, a custom UUID, etc.
     * It must be consistent across server and clients.
     */
    public networkId: number | string;

    /**
     * The server ID of the player who owns or has authority over this entity.
     * The server has the ultimate authority, but ownership can be delegated to clients
     * for latency compensation (e.g., for player movement).
     */
    public owner: number; // Typically the player's server ID

    constructor(networkId: number | string, owner: number) {
        this.networkId = networkId;
        this.owner = owner;
    }
}
