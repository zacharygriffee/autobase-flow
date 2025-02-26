import b4a from "b4a";
import z32 from "z32";
import { createAutobaseIntegration } from "dagify-hyper";
import Autobase from "autobase";

/**
 * Creates an AutobaseFlow instance that integrates Autobase with dagify-hyper.
 *
 * This function initializes an Autobase instance using a Corestore provided by the `getCorestore`
 * function, and sets up the reactive integration via dagify-hyper. It validates and decodes the
 * optional key (which can be a Buffer or a Z32-encoded string), and configures the integration using
 * the provided view name and encoding options.
 *
 * @param {Object} options - Configuration options for creating an AutobaseFlow.
 * @param {function} options.getCorestore - A function that returns a Corestore instance.
 * @param {Buffer|string} [options.key] - An optional key as a Buffer or a Z32-encoded string.
 * @param {string} [options.view="view"] - The name of the view in the store.
 * @param {string} [options.baseEncoding="json"] - The encoding to use for the base hypercore.
 * @param {string} [options.viewEncoding=baseEncoding] - The encoding to use for the view hypercore.
 * @param {...*} [options.restConfig] - Additional configuration options to pass to Autobase.
 *
 * @throws {Error} If `getCorestore` is not a function.
 * @throws {Error} If a key is provided and it is neither a Buffer nor a Z32-encoded string.
 *
 * @returns {Object} An object containing:
 *   - **autobase**: The created Autobase instance.
 *   - **base**: Alias for the Autobase instance.
 *   - **config**: The integration configuration object from dagify-hyper.
 *   - **viewNode**: A reactive node that holds the current view.
 *   - **viewLatestNode**: A reactive node derived from the view node that tracks the latest view.
 *   - **applyNode**: A reactive node that captures updates, view, and hostcalls.
 */
const createAutobaseFlow = ({
                                getCorestore,
                                key,
                                view = "view",
                                baseEncoding = "json",
                                viewEncoding = baseEncoding,
                                ...restConfig
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
    const { config, ...tools } = createAutobaseIntegration({ viewName: view, viewEncoding, baseEncoding });

    // Create an Autobase instance using the provided Corestore and key (if available)
    const autobase = new Autobase(...[cs, key].filter(o => !!o), { ...restConfig, ...config });
    return {
        autobase,
        base: autobase,
        ...tools
    };
};

export { createAutobaseFlow };
