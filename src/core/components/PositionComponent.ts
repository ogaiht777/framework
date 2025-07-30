
import { Component } from '../Component';

/**
 * A component that stores the 3D position of an entity.
 */
export class PositionComponent implements Component {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
