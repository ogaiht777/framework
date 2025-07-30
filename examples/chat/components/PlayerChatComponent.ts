
import { Component } from '../../src/core/Component';

/**
 * An example component that stores chat-related data for an entity.
 */
export class PlayerChatComponent implements Component {
    public lastMessage: string = '';
    public timestamp: number = 0;

    constructor(message: string) {
        this.lastMessage = message;
        this.timestamp = Date.now();
    }
}
