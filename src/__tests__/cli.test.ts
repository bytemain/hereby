import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import test from "ava";
import { execaNode } from "execa";
import tmp from "tmp";

const cliPath = fileURLToPath(new URL("../cli.js", import.meta.url));
const fixturesPath = fileURLToPath(new URL("cli/__fixtures__", import.meta.url));
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

// Coverage carries through to children; run and check that it doesn't break.

test("run cli --help", async (t) => {
    await execaNode(cliPath, ["--help"]);
    t.pass();
});

test("run cli --version", async (t) => {
    await execaNode(cliPath, ["--version"], { cwd: fixturesPath });
    t.pass();
});

test("run cli reexec", async (t) => {
    const tmpdir = tmp.dirSync({ unsafeCleanup: true });
    t.teardown(tmpdir.removeCallback);
    const dir = tmpdir.name;

    const fakeHereby = path.join(dir, "node_modules", "hereby");
    await fs.promises.mkdir(fakeHereby, { recursive: true });

    await fs.promises.writeFile(
        path.join(fakeHereby, "package.json"),
        JSON.stringify({
            name: "hereby",
            type: "module",
            exports: {
                "./cli": "./fake.js",
            },
        }),
    );

    await fs.promises.writeFile(path.join(fakeHereby, "fake.js"), "console.log('It works!')");

    await fs.promises.writeFile(
        path.join(dir, "package.json"),
        JSON.stringify({
            name: "test",
            type: "module",
        }),
    );

    await fs.promises.writeFile(path.join(dir, "Herebyfile.mjs"), "export {};");

    const { stdout } = await execaNode(cliPath, { cwd: dir });
    t.is(stdout, "It works!");
});

test("exception", async (t) => {
    const herebyfilePath = path.join(fixturesPath, "topLevelThrow.mjs");
    const { stdout, stderr, exitCode } = await execaNode(cliPath, ["--herebyfile", herebyfilePath], { reject: false });
    t.snapshot(sanitize(stdout), "stdout");
    t.snapshot(sanitize(stderr), "stderr");
    t.snapshot(exitCode, "exitCode");
});

function sanitize(s: string) {
    s = replaceAll(s, repoRoot, "<repoRoot>/");
    // eslint-disable-next-line no-restricted-globals
    s = replaceAll(s, process.version, "<process.version>");
    return s;
}

function replaceAll(s: string, from: string, to: string) {
    const re = new RegExp(escapeRegExp(from), "g");
    return s.replace(re, to);
}

function escapeRegExp(s: string) {
    return s.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
}
