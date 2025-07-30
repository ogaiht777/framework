fx_version 'cerulean'
games { 'gta5' }

-- Define scripts to be loaded on the server-side
server_scripts {
    'server.js', -- Main entry point for server-side logic (bundled by esbuild)
    'tests/benchmarks/entity-creation.benchmark.js', -- Benchmarks
    'tests/stress/stress-test.js' -- Stress Test
}

-- Define scripts to be loaded on the client-side
client_scripts {
    'client.js' -- Main entry point for client-side logic (bundled by esbuild)
}

-- Define shared scripts that are loaded on both server and client.
-- With esbuild, most of your code will be bundled into server.js and client.js.
-- You might only need this for specific shared files that are not part of the main bundles
-- or if FiveM requires explicit listing for certain types of shared assets.
-- Example (uncomment and adjust if needed):
-- shared_scripts {
--     'shared/config.js'
-- }

-- Files to be exported from this resource, making them accessible by other resources.
-- This is typically used for natives or functions you want to expose.
-- exports {
--     'myExportedFunction'
-- }

-- Files to be imported from other resources.
-- imports {
--     'anotherResourceExport'
-- }

-- Data files (e.g., for streaming assets, data tables)
-- data_files {
--     'ASSET_FILE_TYPE', 'path/to/asset.ext'
-- }
