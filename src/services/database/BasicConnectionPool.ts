
import { IDatabase } from './IDatabase';
import { IConnectionPool } from './IConnectionPool';
import { MockDatabase } from './MockDatabase'; // Using MockDatabase for simulation

/**
 * A basic, in-memory simulation of a connection pool.
 * In a real scenario, this would manage actual database connections.
 */
export class BasicConnectionPool implements IConnectionPool {
    private availableConnections: IDatabase[] = [];
    private inUseConnections: IDatabase[] = [];
    private connectionFactory: () => IDatabase;

    constructor(connectionFactory: () => IDatabase = () => new MockDatabase()) {
        this.connectionFactory = connectionFactory;
        console.log('[BasicConnectionPool] Initialized.');
    }

    public async getConnection(): Promise<IDatabase> {
        if (this.availableConnections.length > 0) {
            const connection = this.availableConnections.pop()!;
            this.inUseConnections.push(connection);
            console.log('[BasicConnectionPool] Reusing connection from pool.');
            return connection;
        } else {
            const newConnection = this.connectionFactory();
            await newConnection.connect(); // Simulate connecting
            this.inUseConnections.push(newConnection);
            console.log('[BasicConnectionPool] Created new connection.');
            return newConnection;
        }
    }

    public releaseConnection(connection: IDatabase): void {
        const index = this.inUseConnections.indexOf(connection);
        if (index > -1) {
            this.inUseConnections.splice(index, 1);
            this.availableConnections.push(connection);
            console.log('[BasicConnectionPool] Released connection back to pool.');
        } else {
            console.warn('[BasicConnectionPool] Attempted to release an unknown connection.');
        }
    }

    public async close(): Promise<void> {
        console.log('[BasicConnectionPool] Closing all connections in pool...');
        // Simulate disconnecting all connections
        const allConnections = [...this.availableConnections, ...this.inUseConnections];
        for (const conn of allConnections) {
            await conn.disconnect();
        }
        this.availableConnections = [];
        this.inUseConnections = [];
        console.log('[BasicConnectionPool] All connections closed.');
        return Promise.resolve();
    }
}
