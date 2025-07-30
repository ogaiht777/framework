
/**
 * A simple SQL Query Builder for common operations.
 * It helps in constructing SQL queries safely and programmatically.
 */
export class QueryBuilder {
    private _sql: string = '';
    private _params: any[] = [];

    private constructor() {}

    /**
     * Starts a SELECT query.
     * @param columns The columns to select. Can be a single string, an array of strings, or '*'.
     */
    static select(columns: string | string[] = '*'): QueryBuilder {
        const builder = new QueryBuilder();
        const cols = Array.isArray(columns) ? columns.join(', ') : columns;
        builder._sql = `SELECT ${cols}`;
        return builder;
    }

    /**
     * Specifies the table for the query.
     * @param table The table name.
     */
    from(table: string): QueryBuilder {
        this._sql += ` FROM ${table}`;
        return this;
    }

    /**
     * Adds a WHERE clause to the query.
     * @param condition The SQL condition string (e.g., 'id = ? AND name = ?').
     * @param params The parameters for the condition.
     */
    where(condition: string, params: any[]): QueryBuilder {
        this._sql += ` WHERE ${condition}`;
        this._params.push(...params);
        return this;
    }

    /**
     * Starts an INSERT query.
     * @param table The table name.
     * @param data An object where keys are column names and values are the data to insert.
     */
    static insert(table: string, data: Record<string, any>): QueryBuilder {
        const builder = new QueryBuilder();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        builder._sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        builder._params.push(...Object.values(data));
        return builder;
    }

    /**
     * Starts an UPDATE query.
     * @param table The table name.
     * @param data An object where keys are column names and values are the data to update.
     */
    static update(table: string, data: Record<string, any>): QueryBuilder {
        const builder = new QueryBuilder();
        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        builder._sql = `UPDATE ${table} SET ${setClauses}`;
        builder._params.push(...Object.values(data));
        return builder;
    }

    /**
     * Starts a DELETE query.
     * @param table The table name.
     */
    static deleteFrom(table: string): QueryBuilder {
        const builder = new QueryBuilder();
        builder._sql = `DELETE FROM ${table}`;
        return builder;
    }

    /**
     * Builds the final SQL query and its parameters.
     * @returns An object containing the SQL string and its parameters.
     */
    build(): { sql: string, params: any[] } {
        return { sql: this._sql, params: this._params };
    }
}
