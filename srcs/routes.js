import { randomUUID } from "node:crypto";
import { Database } from "./database.js"
import formatDateToJson from "./utils.js";

const database = new Database()

export const routes = [
	{
		method: 'GET',
		path: '/tasks',
		handler: (request, response) =>
		{
			const tasks = database.select('tasks')
			const formattedTasks = tasks.map(task => ({
        ...task,
				completed_at : task.completed_at  ? formatDateToJson(task.completed_at ) : null,
        created_at: task.created_at ? formatDateToJson(task.created_at) : task.created_at,
				updated_at : task.updated_at  ? formatDateToJson(task.updated_at ) : null,
      }));

      return response.end(JSON.stringify(formattedTasks));
		}
	},
	{
		method: 'POST',
		path: '/tasks',
		handler: (request, response) => {
			const { title, description } = request.body
			const task = {
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: new Date(),
				updated_at: null,
			}

			database.insert('tasks', task);
			return response.writeHead(201).end()
		}
	},
	{
		method: 'PUT',
		path: '/tasks/:id',
		handler: (request, response) => {
			const { id } = request.params
			const { title, description } = request.body
			const task = {
				title,
				description,
				updated_at: new Date(),
			}

			database.update('tasks', id, task);
			return response.writeHead(201).end()
		}
	},
	{
		method: 'PATCH',
		path: '/tasks/:id/complete',
		handler: (request, response) => {
			const { id } = request.params
			const task = {
				completed_at: new Date(),
				updated_at: new Date(),
			}

			database.updatePatch('tasks', id, task);
			return response.writeHead(201).end()
		}
	},
	{
		method: 'DELETE',
		path: '/tasks/:id',
		handler: (request, response) => {
			const { id } = request.params

			database.delete('tasks', id);
			return response.writeHead(201).end()
		}
	}
];
