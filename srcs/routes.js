import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import formatDateToJson from "./utils/formats.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import fs from "node:fs";
import { dirname } from "path";

import { parse } from "csv-parse";
import { fileURLToPath } from "url";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      if (Array.isArray(tasks)) {
        const formattedTasks = tasks.map((task) => ({
          ...task,
          completed_at: task.completed_at
            ? formatDateToJson(task.completed_at)
            : null,
          created_at: task.created_at
            ? formatDateToJson(task.created_at)
            : task.created_at,
          updated_at: task.updated_at
            ? formatDateToJson(task.updated_at)
            : null,
        }));
        return response.end(JSON.stringify(formattedTasks));
      }
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { title, description } = request.body;
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);
      return response.writeHead(201).end();
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks/import"),
    handler: async (request, response) => {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const processFile = async () => {
        const records = [];
        const parser = fs.createReadStream(`${__dirname}/input.csv`).pipe(
          parse({
            delimiter: ",",
            skip_empty_lines: true,
            from_line: 2,
          })
        );

        for await (const record of parser) {
          database.insert("tasks", {
            id: randomUUID(),
            title: record[0],
            description: record[1],
            completed_at: null,
            created_at: new Date(),
            updated_at: null,
          });
          records.push(record);
        }
        return records;
      };

      (async () => {
        await processFile();
      })();

      return response
        .writeHead(200, { "Content-Type": "multipart/form-data" })
        .end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;
      const existingTask = database
        .select("tasks")
        .find((task) => task.id === id);
      if (existingTask) {
        const task = {
          ...existingTask,
          title,
          description,
          updated_at: new Date(),
        };
        database.update("tasks", id, task);
        return response.writeHead(201).end();
      } else return response.writeHead(400).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params;
      const existingTask = database
        .select("tasks")
        .find((task) => task.id === id);
      if (existingTask) {
        const task = {
          ...existingTask,
          completed_at: new Date(),
          updated_at: new Date(),
        };

        database.updateStatus("tasks", id, task);
        return response.writeHead(201).end();
      } else return response.writeHead(400).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;
      const existingTask = database
        .select("tasks")
        .find((task) => task.id === id);
      if (existingTask) {
        database.delete("tasks", id);
        return response.writeHead(204).end();
      } else return response.writeHead(400).end();
    },
  },
];
