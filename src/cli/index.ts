import path from "path";

import type { Task } from "../index.js";
import { findHerebyfile, loadHerebyfile } from "./loadHerebyfile.js";
import { parseArgs } from "./parseArgs.js";
import { runTasksWithCLIRunner } from "./runner.js";
import { exitWithError } from "./utils.js";

const args = parseArgs(process.argv.slice(2));

const herebyfilePath = args.herebyfile ?? (await findHerebyfile(process.cwd())); // TODO: allow this to fail and then offer some help?
process.chdir(path.dirname(herebyfilePath));

const herebyfile = await loadHerebyfile(herebyfilePath);

if (args.printTasks) {
    // TODO: Use command-line-usage instead.

    if (herebyfile.defaultTask) {
        console.log(`Default task: ${herebyfile.defaultTask.options.name}`);
    }

    const indent = " ".repeat(4);
    console.log("Available tasks:");
    for (const task of herebyfile.tasks) {
        if (task === herebyfile.defaultTask) {
            continue;
        }
        console.log(`${indent}${task.options.name}`);
        if (task.options.description) {
            console.log(`${indent}${indent}${task.options.description}`);
        }
    }

    // TODO: offer some sort of visual representation?
    process.exit(0);
}

const allTasks = new Map<string, Task>();
for (const task of herebyfile.tasks) {
    allTasks.set(task.options.name, task);
}

let tasks: Task[];
if (args.run && args.run.length > 0) {
    tasks = args.run.map((name) => {
        const task = allTasks.get(name);
        if (!task) {
            exitWithError(`Task ${name} does not exist or is not exported in the Herebyfile.`);
        }
        return task;
    });
} else {
    if (!herebyfile.defaultTask) {
        exitWithError("No default task defined; please specify a task name.");
    }
    tasks = [herebyfile.defaultTask];
}

// TODO: shorten path if in $HOME
console.log(`Using Herebyfile ${herebyfile.path}`);

try {
    await runTasksWithCLIRunner(...tasks);
} catch {
    // We will have already printed some message here.
    // Set the error code and let the process run to completion,
    // so we don't end up with an unflushed output.
    process.exitCode = 1;
}
