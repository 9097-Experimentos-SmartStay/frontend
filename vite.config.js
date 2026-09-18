import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const DEFAULT_API_URL = '/api/v1'
const DEFAULT_DEV_PROXY_TARGET = 'http://localhost:10000'

/**
 * Builds the dev-server proxy.
 *
 * Only applies when VITE_SMARTSTAY_API_URL is a relative path (e.g. "/api/v1"):
 * the browser calls the Vite dev server and Vite forwards the request to
 * VITE_DEV_PROXY_TARGET.
 *
 * - Target with no path ("http://localhost:10000"): the request path is kept as is,
 *   so "/api/v1/hotels" goes to "http://localhost:10000/api/v1/hotels".
 * - Target with a path ("https://host/api/v1"): that path replaces the prefix,
 *   so the prefix is never sent twice ("/api/v1/api/v1").
 */
function buildDevProxy(apiUrl, proxyTarget) {
    if (!apiUrl.startsWith('/')) return undefined

    const prefix = apiUrl.replace(/\/+$/, '') || '/'
    const target = new URL(proxyTarget)
    const targetPath = target.pathname.replace(/\/+$/, '')

    return {
        [prefix]: {
            target: target.origin,
            changeOrigin: true,
            rewrite: targetPath
                ? (path) => targetPath + path.slice(prefix.length)
                : undefined,
        },
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const apiUrl = env.VITE_SMARTSTAY_API_URL || DEFAULT_API_URL
    const proxyTarget = env.VITE_DEV_PROXY_TARGET || DEFAULT_DEV_PROXY_TARGET

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            proxy: buildDevProxy(apiUrl, proxyTarget)
        }
    }
})
