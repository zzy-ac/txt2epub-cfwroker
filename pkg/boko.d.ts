/* tslint:disable */
/* eslint-disable */

/**
 * Convert AZW3 to EPUB.
 *
 * Takes raw AZW3 bytes and returns EPUB bytes.
 */
export function azw3_to_epub(data: Uint8Array): Uint8Array;

/**
 * Convert AZW3 to Markdown.
 *
 * Takes raw AZW3 bytes and returns Markdown text as UTF-8 bytes.
 */
export function azw3_to_markdown(data: Uint8Array): Uint8Array;

/**
 * Convert EPUB to AZW3 (KF8 format).
 *
 * Takes raw EPUB bytes and returns AZW3 bytes.
 */
export function epub_to_azw3(data: Uint8Array): Uint8Array;

/**
 * Convert EPUB to KFX (Kindle Format 10).
 *
 * Takes raw EPUB bytes and returns KFX bytes.
 */
export function epub_to_kfx(data: Uint8Array): Uint8Array;

/**
 * Convert EPUB to Markdown.
 *
 * Takes raw EPUB bytes and returns Markdown text as UTF-8 bytes.
 */
export function epub_to_markdown(data: Uint8Array): Uint8Array;

/**
 * Initialize panic hook for better error messages in the browser console.
 */
export function init(): void;

/**
 * Convert KFX to EPUB.
 *
 * Takes raw KFX bytes and returns EPUB bytes.
 */
export function kfx_to_epub(data: Uint8Array): Uint8Array;

/**
 * Convert KFX to Markdown.
 *
 * Takes raw KFX bytes and returns Markdown text as UTF-8 bytes.
 */
export function kfx_to_markdown(data: Uint8Array): Uint8Array;

/**
 * Convert MOBI to AZW3 (upgrade legacy MOBI to KF8 format).
 *
 * Takes raw MOBI bytes and returns AZW3 bytes.
 */
export function mobi_to_azw3(data: Uint8Array): Uint8Array;

/**
 * Convert MOBI to EPUB.
 *
 * Takes raw MOBI bytes and returns EPUB bytes.
 * Handles both legacy MOBI and modern AZW3 (KF8) formats.
 */
export function mobi_to_epub(data: Uint8Array): Uint8Array;

/**
 * Convert MOBI to Markdown.
 *
 * Takes raw MOBI bytes and returns Markdown text as UTF-8 bytes.
 */
export function mobi_to_markdown(data: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly azw3_to_epub: (a: number, b: number) => [number, number, number, number];
    readonly azw3_to_markdown: (a: number, b: number) => [number, number, number, number];
    readonly epub_to_azw3: (a: number, b: number) => [number, number, number, number];
    readonly epub_to_kfx: (a: number, b: number) => [number, number, number, number];
    readonly epub_to_markdown: (a: number, b: number) => [number, number, number, number];
    readonly kfx_to_epub: (a: number, b: number) => [number, number, number, number];
    readonly kfx_to_markdown: (a: number, b: number) => [number, number, number, number];
    readonly mobi_to_azw3: (a: number, b: number) => [number, number, number, number];
    readonly mobi_to_epub: (a: number, b: number) => [number, number, number, number];
    readonly mobi_to_markdown: (a: number, b: number) => [number, number, number, number];
    readonly init: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
