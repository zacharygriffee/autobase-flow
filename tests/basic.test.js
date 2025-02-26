import { test } from "brittle";
import RAM from "random-access-memory";
import Corestore from "corestore";
import { createNode } from "dagify";
import {sleep} from "./helpers/sleep.js";
import {createAutobaseFlow} from "../lib/createAutobaseFlow.js";


test("Simple autobase integration", async t => {
    // Initialize a Corestore instance using reusable in-memory storage.
    const cs = new Corestore(RAM.reusable());

    // Array to record values emitted by the viewLatestNode.
    const values = [];
    // Flag to track when the viewLatestNode has completed.
    let completed = false;

    // Create the AutobaseFlow integration.
    // This sets up the reactive nodes for managing view updates.
    const baseFlow = createAutobaseFlow({ getCorestore: () => cs });

    // Subscribe to the viewLatestNode to monitor changes.
    // Each new value is pushed into the `values` array.
    baseFlow.viewLatestNode.subscribe({
        next: value => values.push(value),
        complete: () => { completed = true; }
    });

    // Create a reactive node that processes updates from applyNode.
    // This node takes incoming updates, transforms the values to uppercase,
    // and appends the result to the view.
    const node = createNode(
        async ({ updates, view }) => {
            // For each update, convert the value to uppercase and append it.
            await view.append(updates.map(({ value }) => value.toUpperCase()));
        },
        baseFlow.applyNode
    );

    // Append "hello" to the Autobase instance.
    await baseFlow.base.append("hello");
    // Wait briefly to allow the reactive flow to process the update.
    await sleep();
    // Verify that the viewLatestNode reflects the transformed value.
    t.is(baseFlow.viewLatestNode.value, "HELLO", "Latest view should be 'HELLO' after first append");

    // Append "world" to the Autobase instance.
    await baseFlow.base.append("world");
    // Wait for the update to propagate.
    await sleep();
    // Verify that the viewLatestNode now reflects the new transformed value.
    t.is(baseFlow.viewLatestNode.value, "WORLD", "Latest view should be 'WORLD' after second append");

    // Close the Autobase instance to trigger cleanup.
    baseFlow.base.close();
    // Complete the reactive node.
    node.complete();
    // Allow time for all completions and cleanups to propagate.
    await sleep();

    // Verify that the collected values match the expected sequence.
    t.alike(values, ["HELLO", "WORLD"], "The values array should contain ['HELLO', 'WORLD']");
    // Confirm that the viewLatestNode has completed.
    t.ok(completed, "viewLatestNode should have completed due to underlying autobase and thus it's view closing");
});
