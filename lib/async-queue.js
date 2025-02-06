class AsyncQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    async _next() {
        if (this.running || this.queue.length === 0) return;
        this.running = true;

        const task = this.queue.shift();
        await task();

        this.running = false;
        this._next(); // Process the next task
    }

    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    resolve(await task());
                } catch (err) {
                    reject(err);
                }
            });
            this._next();
        });
    }
}

export { AsyncQueue }