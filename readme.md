# Autobase Flow

**Autobase Flow** is a high-level wrapper for [Autobase](https://github.com/hypercore-protocol/autobase) that integrates an operator pipeline for efficient update processing. This utility simplifies the creation and management of an Autobase instance while ensuring sequential operation execution.

## Features

- 🚀 **Seamless Autobase Setup** – Instantiates Autobase with optional key support.
- 🔗 **Operator Pipeline Integration** – Supports functional pipelines for processing updates.
- 📜 **Multi-View Support** – Manages single or multiple Autobase views with customizable encoding.
- ⚡ **Efficient Update Handling** – Uses an internal queue to ensure sequential writes and updates.

## Installation

```sh
npm install autobase-flow
```

## Usage

### Creating an Autobase Instance

```javascript
import { createAutobaseFlow } from "autobase-flow";

const autobaseInstance = createAutobaseFlow({
  getCorestore: () => myCorestoreInstance, // Function returning a Corestore
  key: "your-autobase-key", // Optional Z32-encoded string or Buffer
  view: { myView: "json" }, // Single view as an object
  autobaseEncoding: "json", // Default: "json"
  initialOperators: [op1, op2] // Optional array of operator functions
});
```

### Multi-View Example

Autobase Flow supports multiple views, allowing you to define multiple perspectives on the data:

```javascript
const autobaseInstance = createAutobaseFlow({
  getCorestore: () => myCorestoreInstance,
  view: {
    mainView: "json",
    auditLog: "binary"
  }
});
```

### API

#### `createAutobaseFlow(config)`

Creates and returns an Autobase instance with pipeline utilities.

- `config.getCorestore` _(Function, required)_: Function returning a Corestore instance.
- `config.key` _(String | Buffer, optional)_: Z32-encoded key or Buffer for an existing Autobase.
- `config.view` _(String | Object | Array, required)_:
    - If a `string`, it represents a single view name (default encoding: "json").
    - If an `object`, it should map view names to their respective encodings.
    - If an `array`, it should be a list of `{ name, valueEncoding }` objects.
- `config.autobaseEncoding` _(String, optional, default: "json")_: Encoding format for Autobase logs.
- `config.initialOperators` _(Array of Functions, optional)_: Initial pipeline operators.

#### Returned Methods

```javascript
const {
  autobase,    // The Autobase instance
  base,        // Alias for autobase
  update,      // Updates Autobase
  append,      // Appends data
  getKeys,     // Retrieves Autobase keys
  getView,     // Returns a single or multiple views
  get,         // Retrieves a value from a view
  addOperator, // Adds an operator to the pipeline
  removeOperator, // Removes an operator from the pipeline
  close        // Closes the Autobase instance
} = autobaseInstance;
```

### Example

```javascript
await autobaseInstance.append({ message: "Hello, Autobase!" });
await autobaseInstance.update();

const view = await autobaseInstance.getView();
console.log(await view.get(0)); // Output: { message: "Hello, Autobase!" }
```

#### Multi-View Retrieval

```javascript
const auditLog = await autobaseInstance.getView("auditLog");
console.log(await auditLog.get(0)); // Output: Binary data for audit logs
```

## License

MIT License © 2025

---
