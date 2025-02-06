import Autobase from "autobase";
import {createOperatorPipeline} from "operator-pipeline";
import b4a from "b4a";
import z32 from "z32";
import {AsyncQueue} from "./lib/async-queue.js";
import {openSingle} from "./lib/openSingle.js";
import {open} from "./lib/open.js";
import {normalizeView} from "./lib/normalizeView.js";

/**
 * Creates a high-level Autobase instance with a built-in operator pipeline.
 * Supports multiple views and sequential operation handling.
 *
 * @param {object} config - Configuration options for Autobase.
 * @param {Function} config.getCorestore - A function returning a namespaced Corestore instance.
 * @param {string|Buffer} [config.key] - Optional remote Autobase key (Z32 string or Buffer).
 * @param {string|object|object[]} config.view - The view configuration.
 *   - If a `string`, it represents a single view name (default encoding: "json").
 *   - If an `object`, it should map view names to their respective encodings.
 *   - If an `array`, it should be a list of `{ name, valueEncoding }` objects.
 * @param {string} [config.autobaseEncoding="json"] - Encoding format for raw Autobase logs.
 * @param {Function[]} [config.initialOperators=[]] - Optional array of operator functions.
 * @returns {object} - An Autobase instance with pipeline utilities.
 */
const createAutobaseWithPipeline = ({
                                        getCorestore,
                                        key,
                                        view,
                                        autobaseEncoding = "json",
                                        initialOperators = []
                                    }) => {
    if (typeof getCorestore !== "function") {
        throw new Error("getCorestore must be a function that returns a Corestore instance.");
    }

    // Validate & decode the optional key
    if (key) {
        if (!(b4a.isBuffer(key) || typeof key === "string")) {
            throw new Error("Key must be a Buffer or a Z32-encoded string.");
        }
        if (typeof key === "string") {
            key = z32.decode(key);
        }
    }

    // Normalize the `view` argument
    const normalizedView = normalizeView(view);
    const cs = getCorestore();
    const { processUpdates, addOperator, removeOperator } = createOperatorPipeline(initialOperators);

    // Handle `open` logic for single or multiple views
    const autobase = new Autobase(cs, {
        ...(key && { key }), // Conditional inclusion of key, when provided
        open: store => {
            if (typeof normalizedView === "object" && Object.keys(normalizedView).length === 1) {
                // Single view case
                const [name, valueEncoding] = Object.entries(normalizedView)[0];
                return openSingle(store, name, valueEncoding);
            } else {
                // Multiple views case
                return open(store, normalizedView);
            }
        },
        apply: async (updates, view, base) => await processUpdates({ updates, nodes: updates, view, base }),
        valueEncoding: autobaseEncoding
    });

    // Queue for sequential operations
    const Q = new AsyncQueue();

    return {
        autobase,
        base: autobase,
        queue: Q,

        /**
         * Closes the Autobase instance.
         * @param {boolean} gracefully - If true, ensures queued operations finish before closing.
         * @returns {Promise<void>}
         */
        close(gracefully) {
            const close = async () => autobase.close();
            return gracefully ? Q.enqueue(close) : close();
        },

        /**
         * Updates Autobase and waits for completion.
         * @param {object} [config] - Optional update configuration.
         * @returns {Promise<void>}
         */
        update(config) {
            return Q.enqueue(async () => autobase.update(config));
        },

        /**
         * Appends data to Autobase.
         * Ensures updates are processed sequentially using AsyncQueue.
         * @param {any} value - The value to append.
         * @param {boolean} [preUpdate=true] - Whether to update Autobase before appending.
         * @returns {Promise<void>}
         */
        append(value, preUpdate = true) {
            return Q.enqueue(async () => {
                if (preUpdate) await autobase.update();
                await autobase.append(value);
            });
        },

        /**
         * Retrieves Autobase keys and discovery keys.
         * Handles single or multiple views.
         * @returns {Promise<object>} - Keys and discovery IDs.
         */
        async getKeys() {
            await autobase.ready();
            return {
                view:
                    typeof normalizedView === "string"
                        ? {
                            discoveryKey: autobase.view.discoveryKey,
                            key: autobase.view.key,
                            id: z32.encode(autobase.view.key)
                        }
                        : Object.entries(normalizedView).reduce((result, [name]) => {
                            result[name] = {
                                discoveryKey: autobase.view[name].discoveryKey,
                                key: autobase.view[name].key,
                                id: z32.encode(autobase.view[name].key)
                            };
                            return result;
                        }, {}),
                base: {
                    discoveryKey: autobase.discoveryKey,
                    key: autobase.key,
                    id: z32.encode(autobase.key)
                }
            };
        },

        /**
         * Retrieves a value from the Autobase view.
         * Supports single or multiple views.
         * @param {number} key - The index of the value.
         * @param {string} [viewName] - The name of the view (required if multiple views exist).
         * @returns {Promise<any|null>} - Retrieved value or `null` if not found.
         */
        get(key, viewName = null) {
            return Q.enqueue(async () => {
                if (key == null) {
                    throw new Error("A key must be provided to retrieve a value.");
                }

                await autobase.ready();

                // If multiple views exist, require `viewName`
                if (Object.keys(normalizedView).length > 1) {
                    if (!viewName) {
                        throw new Error("Multiple views exist. Please specify a 'viewName' to retrieve the value.");
                    }
                    if (!autobase.view[viewName]) {
                        throw new Error(`View '${viewName}' does not exist.`);
                    }
                    return autobase.view[viewName].get(key);
                }

                return autobase.view.get(key);
            });
        },

        /**
         * Ensures Autobase is ready and returns the view.
         * Supports single or multiple views.
         * @param {string} [viewName] - The name of the view to retrieve (optional if single view).
         * @returns {Promise<object>} - The Autobase view instance.
         */
        async getView(viewName) {
            await autobase.ready();
            return viewName ? autobase.view[viewName] : autobase.view;
        },

        addOperator,
        removeOperator
    };
};

export { createAutobaseWithPipeline };
