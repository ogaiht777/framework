
// This file serves as the public API for the core ECS module.

export { Entity, EntityId } from './Entity';
export { Component, ComponentType, getComponentType } from './Component';
export { ComponentStore } from './ComponentStore';
export { System } from './System';
export { World } from './World';
export { IModule } from './IModule';

// Exporting components that are part of the core framework
export { NetworkComponent } from './components/NetworkComponent';
