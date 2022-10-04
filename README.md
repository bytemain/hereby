<div align="center">

<h1>hereby</h1>

<a href="https://npmjs.com/package/hereby">
    <img src="https://img.shields.io/npm/v/hereby.svg">
</a>
<a href="https://nodejs.org">
    <img src="https://img.shields.io/node/v/hereby.svg">
</a>
<a href="https://packagephobia.com/result?p=hereby">
    <img src="https://packagephobia.com/badge?p=hereby">
</a>
<a href="https://github.com/jakebailey/hereby/actions/workflows/ci.yml">
    <img src="https://github.com/jakebailey/hereby/actions/workflows/ci.yml/badge.svg">
</a>
<a href="https://codecov.io/gh/jakebailey/hereby">
    <img src="https://codecov.io/gh/jakebailey/hereby/branch/main/graph/badge.svg?token=YL2Z1uk5dh">
</a>

</div>

`hereby` is a simple task runner.

```
$ npm i -D hereby
$ yarn add -D hereby
```

## Herebyfile.mjs

Tasks are defined in `Herebyfile.mjs`. Exported tasks are available to run
at the CLI, with support for `export default`.

For example:

```js
import { execa } from "execa";
import { task } from "hereby";

export const build = task({
    name: "build",
    run: async () => {
        await execa("tsc", ["-b", "./src"]);
    },
});

export const test = task({
    name: "test",
    dependencies: [build],
    run: async () => {
        await execa("node", ["./out/test.js"]);
    },
});

export const lint = task({
    name: "lint",
    run: async () => {
        await runLinter(...);
    },
})

export const testAndLint = task({
    name: "testAndLint",
    dependencies: [test, lint],
})

export default testAndLint;
```

## Running tasks

Given the above Herebyfile:

```
$ hereby build  # Run only build
$ hereby test   # Run test, which depends on build.
$ hereby        # Run the default exported task.
```

## Flags

`hereby` also supports a handful of flags:

```
-h, --help          Display this usage guide.
--herebyfile path   A path to a Herebyfile. Optional.
-T, --tasks         Print a listing of the available tasks.
```

## ESM

`hereby` is implemented in ES modules. But, don't fret! This does not mean
that your project must be ESM-only, only that your `Herebyfile` must be ESM
module so that `hereby`'s `task` function can be imported. It's recommended
to use the filename `Herebyfile.mjs` to ensure that it is treated as ESM. This
will work in a CommonJS project; ES modules can import CommonJS modules.

If your package already sets `"type": "module"`, `Herebyfile.js` will work
as well.
