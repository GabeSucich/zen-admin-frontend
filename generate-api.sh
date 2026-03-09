#!/bin/bash
set -e

BACKEND_URL="${ZEN_ADMIN_API_URL:-http://localhost:8000}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Fetching OpenAPI spec from $BACKEND_URL..."
curl -s "$BACKEND_URL/openapi.json" > "$SCRIPT_DIR/openapi.json"

echo "Generating API client..."
npx openapi-typescript-codegen --input "$SCRIPT_DIR/openapi.json" --output "$SCRIPT_DIR/src/api" --client fetch

echo "Patching OpenAPI.ts with custom config..."
cat > "$SCRIPT_DIR/src/api/core/OpenAPI.ts" << 'OPENAPI_EOF'
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
    BASE: string;
    VERSION: string;
    WITH_CREDENTIALS: boolean;
    CREDENTIALS: 'include' | 'omit' | 'same-origin';
    TOKEN?: string | Resolver<string> | undefined;
    USERNAME?: string | Resolver<string> | undefined;
    PASSWORD?: string | Resolver<string> | undefined;
    HEADERS?: Headers | Resolver<Headers> | undefined;
    ENCODE_PATH?: ((path: string) => string) | undefined;
};

export const OpenAPI: OpenAPIConfig = {
    BASE: import.meta.env.VITE_ZEN_ADMIN_API_URL || 'http://localhost:8000',
    VERSION: '0.1.0',
    WITH_CREDENTIALS: false,
    CREDENTIALS: 'include',
    TOKEN: async () => {
        const token = localStorage.getItem("token");
        return token || "";
    },
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};
OPENAPI_EOF

echo "Done! API client generated in src/api/"
