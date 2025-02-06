# Autobase Flow

**Autobase Flow** is a high-level wrapper for [Autobase](https://github.com/hypercore-protocol/autobase) that integrates an operator pipeline for efficient update processing. This utility simplifies the creation and management of an Autobase instance while ensuring sequential operation execution.

## Features

- 🚀 **Seamless Autobase Setup** – Instantiates Autobase with optional key support.
- 🔗 **Operator Pipeline Integration** – Supports functional pipelines for processing updates.
- 📜 **View Management** – Automatically manages Autobase views with encoding options.
- ⚡ **Efficient Update Handling** – Uses an internal queue to ensure sequential writes and updates.

## Installation

```sh
npm install autobase-flow
```

## Usage

### Creating an Autobase Instance

```javascript
import { createAutobaseWithPipeline } from "autobase-flow";

const autobaseInstance = createAutobaseWithPipeline({
  getCorestore: () => myCorestoreInstance, // Function returning a Corestore
  key: "your-autobase-key", // Optional Z32-encoded string or Buffer
  viewName: "my-view",
  autobaseEncoding: "json", // Default: "json"
  viewEncoding: "json", // Default: "json"
  initialOperators: [op1, op2] // Optional array of operator functions
});
```

### API

#### `createAutobaseWithPipeline(config)`

Creates and returns an Autobase instance with pipeline utilities.

- `config.getCorestore` _(Function, required)_: Function returning a Corestore instance.
- `config.key` _(String | Buffer, optional)_: Z32-encoded key or Buffer for an existing Autobase.
- `config.viewName` _(String, required)_: The name of the Autobase view.
- `config.autobaseEncoding` _(String, optional, default: "json")_: Encoding format for Autobase logs.
- `config.viewEncoding` _(String, optional, default: "json")_: Encoding format for the view.
- `config.initialOperators` _(Array of Functions, optional)_: Initial pipeline operators.

#### Returned Methods

```javascript
const {
  autobase,    // The Autobase instance
  base,        // Alias for autobase
  update,      // Updates Autobase
  append,      // Appends data
  getKeys,     // Retrieves Autobase keys
  getView,     // Returns the view
  get,         // Retrieves a value
  addOperator, // Adds an operator to the pipeline
  removeOperator // Removes an operator from the pipeline
} = autobaseInstance;
```

### Example

```javascript
const view = await autobaseInstance.getView();
await autobaseInstance.append({ message: "Hello, Autobase!" });
console.log(await view.get(0)); // Output: { message: "Hello, Autobase!" }
```

## License

MIT License © 2025
