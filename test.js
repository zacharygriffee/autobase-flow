import {createAutobaseWithPipeline} from "./index.js";
import {test, solo} from "brittle";
import Corestore from "corestore";
import RAM from "random-access-memory";
import {concatMap, from} from "rxjs";

const stringifyOp = ({updates, view}) => Promise.all(updates.map(({value}) => view.append(JSON.stringify(value))));
const upperOp = concatMap(({updates, view}) =>
    from(updates).pipe(
        concatMap(
            async ({value}) => {
                await view.append(value.toUpperCase());
            }
        )
    ));

const concatString = (viewName, string) => {
    return async ({updates, view}) => {
        console.log(updates);
        for (const {value} of updates) {
            await view[viewName].append(`${value}${string}`);
        }
    }
}

test("With regular function op", async t => {
    const {append, get, close} = createAutobaseWithPipeline({
        getCorestore: () => new Corestore(RAM.reusable()),
        view: {test: "utf8"},
        autobaseEncoding: "json",
        initialOperators: [stringifyOp]
    });
    append({hello: "world"});
    const result = await get(0);
    t.is(result, `{"hello":"world"}`);
    t.teardown(close);
});

test("With rxjs operators", async t => {
    const {append, get, close} = createAutobaseWithPipeline({
        getCorestore: () => new Corestore(RAM.reusable()),
        view: {test: "utf8"},
        autobaseEncoding: "utf8",
        initialOperators: [upperOp]
    });
    append("you are awesome");
    const result = await get(0);
    t.is(result, `YOU ARE AWESOME`);
    t.teardown(close);
});

test("With multiple views", async t => {
    const {append, get, close} = createAutobaseWithPipeline({
        getCorestore: () => new Corestore(RAM.reusable()),
        view: {a: "utf8", b: "utf8"},
        autobaseEncoding: "json",
        initialOperators: [concatString("a", "red"), concatString("b", "blue")]
    });
    append("what color?: ");
    const resultA = await get(0, "a");
    const resultB = await get(0, "b");

    t.is(resultA, "what color?: red");
    t.is(resultB, "what color?: blue");
    t.teardown(close);
});
