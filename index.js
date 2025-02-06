import Autobase from "autobase";
import { createOperatorPipeline } from "operator-pipeline";
import b4a from "b4a";
import z32 from "z32";
import { AsyncQueue } from "./lib/async-queue.js";

/**
 * Creates a high-level Autobase instance with a built-in operator pipeline.
 * @param {object} config - Configuration options for Autobase.
 * @param {Function} config.getCorestore - A function returning a namespaced Corestore.
 * @param {string|Buffer} [config.key] - Optional remote Autobase key (Z32 string or Buffer).
 * @param {string} config.viewName - The name of the Autobase view.
 * @param {string} [config.autobaseEncoding="json"] - Encoding format for raw Autobase logs.
 * @param {string} [config.viewEncoding="json"] - Encoding format for the view.
 * @param {Function[]} [config.initialOperators=[]] - Optional array of initial operator functions.
 * @returns {object} - The Autobase instance with pipeline utilities.
 */
const createAutobaseWithPipeline = ({
                                        getCorestore,
                                        key,
                                        viewName,
                                        autobaseEncoding = "json",
                                        viewEncoding = "json",
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

    const cs = getCorestore();
    const { processUpdates, addOperator, removeOperator } = createOperatorPipeline(initialOperators);

    // Construct Autobase with or without the optional key
    const autobaseArgs = key ? [cs, key] : [cs];

    const autobase = new Autobase(...autobaseArgs, {
        open: store => store.get({ name: viewName, valueEncoding: viewEncoding }),
        apply: async (updates, view, base) => await processUpdates({ updates, nodes: updates, view, base }),
        valueEncoding: autobaseEncoding
    });

    // Queue for sequential operations
    const Q = new AsyncQueue();

    /**
     * Ensures Autobase is ready and returns the view.
     * @returns {Promise<object>} The Autobase view instance.
     */
    const getView = async () => {
        await autobase.ready();
        return autobase.view;
    };

    /**
     * Retrieves Autobase keys and discovery keys.
     * @returns {Promise<object>} Keys and discovery IDs.
     */
    const getKeys = async () => {
        await autobase.ready();
        return {
            view: {
                discoveryKey: autobase.view.discoveryKey,
                key: autobase.view.key,
                id: z32.encode(autobase.view.key)
            },
            base: {
                discoveryKey: autobase.discoveryKey,
                key: autobase.key,
                id: z32.encode(autobase.key)
            }
        };
    };

    /**
     * Appends data to Autobase.
     * Ensures updates are processed sequentially using AsyncQueue.
     * @param {any} value - The value to append.
     * @param {boolean} [preUpdate=true] - Whether to update Autobase before appending.
     * @returns {Promise<void>}
     */
    const append = (value, preUpdate = true) =>
        Q.enqueue(async () => {
            if (preUpdate) await autobase.update();
            await autobase.append(value);
        });

    /**
     * Updates Autobase and waits for completion.
     * @param {object} [config] - Optional update configuration.
     * @returns {Promise<void>}
     */
    const update = (config) => Q.enqueue(async () => autobase.update(config));

    /**
     * Retrieves a value from the Autobase view.
     * Ensures Autobase is ready before querying the view.
     * @param {number} idx - Index of the value.
     * @param {object} [config] - Optional configuration.
     * @returns {Promise<any|null>} Retrieved value or `null` if not found.
     */
    const get = (idx, config) =>
        Q.enqueue(async () => {
            if (!autobase.view) await autobase.ready();
            return autobase?.view?.get(idx, config) ?? null;
        });

    return {
        autobase,
        base: autobase,
        update,
        append,
        getKeys,
        getView,
        get,
        addOperator,
        removeOperator
    };
};

export { createAutobaseWithPipeline };
