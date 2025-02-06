export const normalizeView = (view) => {
    if (typeof view === "string") {
        // Single view case: create an object with the default encoding
        return { [view]: "json" };
    }

    if (view && typeof view === "object" && !Array.isArray(view)) {
        if (view.name) {
            // Single view object case: create a single-entry object
            return { [view.name]: view.valueEncoding || "json" };
        }
        // Already an object with multiple views, assume it's correct
        return view;
    }

    if (Array.isArray(view)) {
        // Convert array of view objects to an object: { name: encoding }
        return view.reduce((result, { name, valueEncoding = "json" }) => {
            result[name] = valueEncoding;
            return result;
        }, {});
    }

    throw new Error("Invalid view format. Must be a string, object, or array of objects.");
};