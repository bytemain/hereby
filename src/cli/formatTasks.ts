import chalk from "chalk";
import commandLineUsage from "command-line-usage";

import type { Task } from "../index.js";
import { stringSorter, taskSorter } from "./utils.js";

export function formatTasks(tasks: Task[], defaultTask?: Task) {
    tasks = tasks
        .slice(0)
        .filter((task) => !task.options.hiddenFromTaskList)
        .sort(taskSorter);

    const sections: commandLineUsage.Section[] = [];
    sections.push({
        header: "Available tasks",
        content: tasks.map((task) => {
            const name =
                task !== defaultTask ? chalk.blue(task.options.name) : `${chalk.green(task.options.name)} (default)`;

            const descriptionParts: string[] = [];
            if (task.options.description) {
                descriptionParts.push(task.options.description);
            }

            if (task.options.dependencies && task.options.dependencies.length > 0) {
                const deps = task.options.dependencies
                    .filter((task) => !task.options.hiddenFromTaskList)
                    .map((task) => task.options.name)
                    .sort(stringSorter)
                    .map((v) => chalk.blue(v));
                descriptionParts.push(`Depends on: ${deps.join(", ")}`);
            }

            return { name, description: descriptionParts.join("\n") };
        }),
    });

    return commandLineUsage(sections);
}
