import {createAutobaseWithPipeline} from "./index.js";
import {test} from "brittle";
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

test("With regular function op", async t => {
    const {append, get} = createAutobaseWithPipeline({
        getCorestore: () => new Corestore(RAM.reusable()),
        viewName: "test",
        viewEncoding: "utf8",
        autobaseEncoding: "json",
        initialOperators: [stringifyOp]
    });
    append({hello: "world"});
    const result = await get(0);
    t.is(result, `{"hello":"world"}`);
});

test("With rxjs operators", async t => {
    const {append, get} = createAutobaseWithPipeline({
        getCorestore: () => new Corestore(RAM.reusable()),
        viewName: "test",
        viewEncoding: "utf8",
        autobaseEncoding: "utf8",
        initialOperators: [upperOp]
    });
    append("you are awesome");
    const result = await get(0);
    t.is(result, `YOU ARE AWESOME`);
});