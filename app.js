const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3001, () => {
    console.log("server is running at localhost:3000");
  });
};

initializeDbAndServer();

const hasPriorityAndStatus = (query) => {
  return query.status !== undefined && query.priority !== undefined;
};

const hasPriority = (query) => {
  return query.priority !== undefined;
};

const hasStatus = (query) => {
  return query.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;
  let getSqlQuery = "";
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getSqlQuery = `
          select * from todo where todo like '%${search_q}%' AND status='${status}' AND priority='${priority}';`;
      break;
    case hasPriority(request.query):
      getSqlQuery = `select * from todo where todo like '%${search_q}%' AND priority='${priority}';`;
      break;
    case hasStatus(request.query):
      getSqlQuery = `select * from todo where todo like '%${search_q}%'AND status='${status}';`;
      break;

    default:
      getSqlQuery = `select * from todo where todo like '%${search_q}%';`;
      break;
  }

  let result = await db.all(getSqlQuery);
  response.send(result);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `select * from todo where id=${todoId};`;
  response.send(await db.get(getQuery));
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

const asPriority = (priority) => {
  return priority.priority !== "";
};
const asStatus = (Status) => {
  return Status.status !== "";
};

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { priority = "", status = "", todo = "" } = request.body;
  let updateQuery = "";
  let update = "";
  switch (true) {
    case asPriority(request.body):
      updateQuery = `update todo set priority='${priority}';`;
      update = "priority";
      break;
    case asStatus(request.body):
      updateQuery = `update todo set status='${status}';`;
      update = "status";
      break;
    default:
      updateQuery = `update todo set todo='${todo}';`;
      update = "todo";
      break;
  }

  const res = await db.run(updateQuery);
  response.send(`${update} updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `Delete from todo where id=${todoId};`;
  const result = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
