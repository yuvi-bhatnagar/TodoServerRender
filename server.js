const express =  require("express");
const fs = require("fs");
const app=express();
var session = require("express-session");
app.set("view engine","ejs");
app.set("views",__dirname+'/views');
app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "it a session middleware",
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("index", { username: request.session.username });
    return;
  }
  response.redirect("/login");
});

app.get("/login", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/");
    return;
  }
  response.render("login", { error: null });
});

app.get("/signup", function (request, response) {
  if (request.session.isLoggedin) {
    response.redirect("/");
    return;
  }
  response.render("signup", { error: null });
});

app.get("/about", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("about", { username: request.session.username });
    return;
  }
  response.redirect("/login");
});

app.get("/contact", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("contact", { username: request.session.username });
    return;
  }
  response.redirect("/login");
});

app.get("/todo", function (request, response) {
  if (request.session.isLoggedin) {
    response.render("todo", { username: request.session.username });
    return;
  }
  response.redirect("/login");
});

app.get("/todo.js", function (request, response) {
  response.sendFile(__dirname + "/public/js/todo.js");
});
app.get("/todos", function (request, response) {
  const name = request.query.name;

  getTodos(name, false, function (error, todos) {
    if (error) {
      response.status(500);
      response.json({ error: error });
    } else {
      response.status(200);
      response.json(todos);
    }
  });
});
app.get("/user", function(req, response) {
    const user=req.session.username;
      response.status(200);
      response.json(user);
});

app.get("/logout", function (request, response) {
  if (request.session.isLoggedin) {
    request.session.destroy(function (error) {
      if (error) {
        response.status(500);
        response.send("Something went wrong please try later");
      } else {
        response.render("logout");
      }
    });
    return;
  }
  response.redirect("/login");
});

app.get("/error", function (request, response) {
  response.sendFile(__dirname + "/error.html");
});

app.post("/login", function (request, response) {
  const username = request.body.username;
  const password = request.body.password;
  fs.readFile("user.gif", "utf-8", function (error, data) {
    if (error) {
      response.status(500);
      response.send();
    } else {
      try {
        let users = JSON.parse(data);
        const user = users.find(function (user) {
          return user.username === username && user.password === password;
        });
        if (user) {
          request.session.isLoggedin = true;
          request.session.username = username;
          response.redirect("/");
          return;
        } else {
          response.render("login", { error: "Invalid username or password" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
});

app.post("/signup", function (request, response) {
  const username = request.body.username;
  const email = request.body.email;
  const password = request.body.password;
  let user = { username: username, email: email, password: password };
  fs.readFile("user.gif", "utf-8", function (error, data) {
    if (error) {
      response.status(403);
      response.send();
    } else {
      if (data.length === 0) {
        data = "[]";
      }
      try {
        let arr = JSON.parse(data);
        const already_present_email = arr.find(function (name) {
          return name.email === email;
        });
        const already_present_user = arr.find(function (name) {
          return name.username === username;
        });

        if (already_present_email) {
          response.render("signup", {
            error: "Email address is already present",
          });
        } 
        else {
          if (already_present_user) {
            response.render("signup", { error: "Username is already taken" });
          } else {
            arr.push(user);
            fs.writeFile("user.gif", JSON.stringify(arr), function (error) {
              if (error) {
                console.log(error);
              } else {
                response.redirect("/login");
              }
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
});

app.post("/todo", function (request, response) {
  const todo = request.body;

  saveTodos(todo, function (error) {
    if (error) {
      response.status(500);
      response.json({ error: error });
    } else {
      response.status(200);
      response.send();
    }
  });
});
app.delete("/todo", function (request, response) {
  const todo = request.body;

  getTodos(null, true, function (error, todos) {
    if (error) {
      response.status(500);
      response.json({ error: error });
    } else {
      const filteredTodos = todos.filter(function (todoItem) {
        return todoItem.text !== todo.text;
      });

      fs.writeFile(
        "./todos.mp4",
        JSON.stringify(filteredTodos),
        function (error) {
          if (error) {
            response.status(500);
            response.json({ error: error });
          } else {
            response.status(200);
            response.send();
          }
        }
      );
    }
  });
});

app.get("*", function (request, response) {
  response.render("404");
});
app.listen(8000, function () {
  console.log("Server is running on port 8000");
});

function getTodos(username, all, callback) {
  fs.readFile("./todos.mp4", "utf-8", function (error, data) {
    if (error) {
      callback(error);
    } else {
      if (data.length === 0) {
        data = "[]";
      }

      try {
        let todos = JSON.parse(data);

        if (all) {
          callback(null, todos);
          return;
        }

        const filteredTodos = todos.filter(function (todo) {
          return todo.createdBy === username;
        });

        callback(null, filteredTodos);
      } catch (error) {
        callback(null, []);
      }
    }
  });
}



function saveTodos(todo, callback) {
  getTodos(null, true, function (error, todos) {
    if (error) {
      callback(error);
    } else {
      todos.push(todo);

      fs.writeFile("./todos.mp4", JSON.stringify(todos), function (error) {
        if (error) {
          callback(error);
        } else {
          callback();
        }
      });
    }
  });
}
app.post("/change", function (request, response) {
  const todo = request.body;
  getTodos(null, true, function (error, todos) {
    if (error) {
      response.status(500);
      response.json({ error: error });
    } else {
      const newtodolist = todos.filter(function (todoItem) {
        if (todoItem.text === todo.text && todoItem.user === todo.user) {
          if (todoItem.iscompleted === false) {
            todoItem.iscompleted = true;
            return todoItem;
          } else {
            todoItem.iscompleted = false;
            return todoItem;
          }
        }
        return todoItem;
      });
      fs.writeFile("todos.mp4", JSON.stringify(newtodolist), function (error) {
        if (error) {
          response.status(500);
          response.json({ error: error });
        } else {
          response.status(200);
          response.send();
        }
      });
    }
  });
});
