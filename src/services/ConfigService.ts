
/**
 * A type-safe configuration service.
 * It can be used to load, access, and manage configuration for the framework or specific modules.
 * @template T The interface representing the shape of the configuration object.
 */
export class ConfigService<T> {
    private config: T;
    private _filePath: string | null = null;
    private _environment: string | null = null;

    /**
     * Initializes the service with a default configuration.
     * @param defaultConfig The default configuration object.
     */
    constructor(private defaultConfig: T, private validator?: (config: T) => void) {
        this.config = { ...defaultConfig };
    }

    /**
     * Loads configuration from a JSON file and merges it with the default configuration.
     * This is where hot-reloading logic would be triggered.
     * @param filePath The path to the configuration file, relative to the resource root.
     */
    public loadFromFile(filePath: string, environment?: string): void {
        this._filePath = filePath;
        this._environment = environment || null;
        this.reload();
    }

    /**
     * Reloads the configuration from the file path previously set by loadFromFile.
     * This method is intended to be called by a file watcher for hot-reloading.
     */
    public reload(): void {
        if (!this._filePath) {
            console.warn('[ConfigService] No file path set for reloading. Call loadFromFile first.');
            return;
        }

        const oldConfig = { ...this.config }; // Store current config for potential rollback

        // Start with default configuration
        this.config = { ...this.defaultConfig };

        try {
            // Load base configuration
            const baseFileContent = this.simulateLoadResourceFile(this._filePath);
            if (baseFileContent) {
                const loadedBaseConfig = JSON.parse(baseFileContent);
                this.config = { ...this.config, ...loadedBaseConfig };
                console.log(`[ConfigService] Base configuration loaded from ${this._filePath}`);
            }

            // Load environment-specific configuration if an environment is set
            if (this._environment) {
                const envFilePath = this._filePath.replace('.json', `.${this._environment}.json`);
                const envFileContent = this.simulateLoadResourceFile(envFilePath);
                if (envFileContent) {
                    const loadedEnvConfig = JSON.parse(envFileContent);
                    this.config = { ...this.config, ...loadedEnvConfig };
                    console.log(`[ConfigService] Environment-specific configuration loaded from ${envFilePath}`);
                }
            }

            console.log(`[ConfigService] Configuration reloaded.`);

            // Validate the loaded configuration if a validator is provided
            if (this.validator) {
                try {
                    this.validator(this.config);
                    console.log('[ConfigService] Configuration validated successfully.');
                } catch (validationError) {
                    console.error(`[ConfigService] Configuration validation failed:`, validationError);
                    // Revert to the previous valid configuration if validation fails
                    this.config = oldConfig;
                    console.warn('[ConfigService] Reverted to previous valid configuration due to validation failure.');
                }
            }
        } catch (error) {
            console.error(`[ConfigService] Could not reload config. Using current values.`, error);
            // If reload fails, keep the current config, don't revert to defaults.
        }
    }

    /**
     * Simulates the LoadResourceFile native for development outside of FiveM.
     * In a real environment, this method would not exist.
     * @param filePath The path to the file.
     * @returns The file content as a string or null.
     */
    private simulateLoadResourceFile(filePath: string): string | null {
        // This is a placeholder. In a test environment, you could use fs.readFileSync here.
        console.warn(`[ConfigService] Simulating file load for: ${filePath}. This should be replaced by a real implementation in a test runner.`);
        return null;
    }

    /**
     * Retrieves a configuration value in a type-safe manner.
     * @param key The key of the configuration value to retrieve.
     * @returns The configuration value.
     */
    public get<K extends keyof T>(key: K): T[K] {
        return this.config[key];
    }

    /**
     * Returns the entire configuration object.
     * @returns The full configuration object.
     */
    public getAll(): T {
        return this.config;
    }
}
