import {openSingle} from "./openSingle.js";

export const open = (store, views) => {
    if (!views || typeof views !== "object") {
        throw new Error("Invalid input for 'views'. It must be an object where the key is the view name, and the value is the encoding.");
    }

    // Iterate over the keys in the `views` object and open each one
    return Object.entries(views).reduce((result, [viewName, valueEncoding]) => {
        if (!viewName) {
            throw new Error("Each view entry must have a valid key as the view name.");
        }
        result[viewName] = openSingle(store, viewName, valueEncoding || "json");
        return result;
    }, {});
};