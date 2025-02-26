# Autobase-Flow

Autobase-Flow is a lightweight library that integrates Autobase with Dagify-hyper reactive nodes. It provides a single function, `createAutobaseFlow`, to set up a reactive integration for Autobase. This makes it easy to build peer-to-peer hyper ecosystem tools with a reactive data flow architecture.

---

## Features

- **Reactive Integration:** Leverages Dagify-hyper to create reactive nodes that manage Autobase views and updates.
- **Simplified Setup:** A single function to initialize an Autobase instance with the necessary reactive integrations.
- **Flexible Configuration:** Supports custom encoding options, key validation, and additional Autobase configuration.

---

## Installation

Install the package via npm:

```bash
npm install autobase-flow
```

Make sure you also have the required peer dependencies installed (e.g., `autobase`, `hypercore`, and `dagify-hyper`).

---

## Usage

Below is a simple example of how to use `createAutobaseFlow` to initialize an Autobase integration.

```js
import { createAutobaseFlow } from 'autobase-flow';
import Corestore from 'corestore';
import RAM from 'random-access-memory';

// Function that returns a Corestore instance
const getCorestore = () => new Corestore(RAM.reusable());

// Create the AutobaseFlow integration with custom options.
const { autobase, viewLatestNode, applyNode } = createAutobaseFlow({
  getCorestore,
  view: "my-view",
  baseEncoding: "json",
  viewEncoding: "json"
});

// Use the autobase instance as usual.
await autobase.append("hello");

// Since viewLatestNode is reactive, it will update when the view changes.
console.log("Latest view:", viewLatestNode.value);
```

In this example, `createAutobaseFlow`:

- Validates and decodes an optional key.
- Retrieves a Corestore instance via the provided `getCorestore` function.
- Configures the Autobase integration using Dagify-hyper's reactive nodes.
- Returns the Autobase instance (aliased as `autobase` and `base`) along with the reactive nodes (`viewLatestNode` and `applyNode`).

---

## API Documentation

### createAutobaseFlow

```js
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
  // ... implementation as shown in the source code ...
};
```

---

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or pull requests, please follow the guidelines in our [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
