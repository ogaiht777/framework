import { IModule } from '../../src/core/IModule';
import { DIContainer } from '../../src/services/DIContainer';
import { World } from '../../src/core/World';
import { EntityId } from '../../src/core/Entity';

// This is a simple in-memory economy system for demonstration purposes.
// In a real application, this would interact with a database.
class SimpleEconomySystem {
    private balances: Map<EntityId, number> = new Map();

    getBalance(entityId: EntityId): number {
        return this.balances.get(entityId) || 0;
    }

    addMoney(entityId: EntityId, amount: number): number {
        if (amount <= 0) throw new Error("Amount must be positive.");
        const newBalance = this.getBalance(entityId) + amount;
        this.balances.set(entityId, newBalance);
        console.log(`[EconomySystem] Entity ${entityId} added ${amount}. New balance: ${newBalance}`);
        return newBalance;
    }

    removeMoney(entityId: EntityId, amount: number): number {
        if (amount <= 0) throw new Error("Amount must be positive.");
        const currentBalance = this.getBalance(entityId);
        if (currentBalance < amount) throw new Error("Insufficient funds.");
        const newBalance = currentBalance - amount;
        this.balances.set(entityId, newBalance);
        console.log(`[EconomySystem] Entity ${entityId} removed ${amount}. New balance: ${newBalance}`);
        return newBalance;
    }

    transferMoney(fromEntityId: EntityId, toEntityId: EntityId, amount: number): boolean {
        try {
            this.removeMoney(fromEntityId, amount);
            this.addMoney(toEntityId, amount);
            console.log(`[EconomySystem] Transferred ${amount} from ${fromEntityId} to ${toEntityId}.`);
            return true;
        } catch (error) {
            console.error(`[EconomySystem] Transfer failed: ${error}`);
            return false;
        }
    }
}

export class EconomyModule implements IModule {
    public readonly name = 'Economy';

    initialize(container: DIContainer): void {
        console.log(`[EconomyModule] Initializing...`);

        const world = container.resolve<World>(World);
        const economySystem = new SimpleEconomySystem();

        // Example usage:
        const player1 = world.createEntity();
        const player2 = world.createEntity();

        economySystem.addMoney(player1.id, 100);
        economySystem.transferMoney(player1.id, player2.id, 50);

        console.log(`[EconomyModule] Player 1 balance: ${economySystem.getBalance(player1.id)}`);
        console.log(`[EconomyModule] Player 2 balance: ${economySystem.getBalance(player2.id)}`);

        console.log(`[EconomyModule] Initialized.`);
    }

    destroy?(): void {
        console.log(`[EconomyModule] Destroying...`);
    }
}
