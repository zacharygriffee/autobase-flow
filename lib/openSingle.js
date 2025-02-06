export const openSingle = (store, name, encoding) => {
    if (!name) {
        throw new Error("A valid 'name' must be provided for the view.");
    }
    return store.get({name, valueEncoding: encoding});
};