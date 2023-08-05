const todoTextNode = document.getElementById("new-todo");
const addTodoButton = document.getElementById("add-todo");
var userName="";
(async function() {
  userName = await getUser();
  getTodos();
})();
addTodoButton.addEventListener("click", function () {
  const todoTextValue = todoTextNode.value;

  if (todoTextValue) {
    saveTodo(todoTextValue, function (error) {
      if (error) {
        alert(error);
      } else {
        addTodoToDOM(todoTextValue,false);
        todoTextNode.value="";
      }
    });
  } else {
    alert("Please enter a todo");
  }
});
function saveTodo(todo, callback) {
  fetch("/todo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: todo,iscompleted:false, createdBy: userName }),
  }).then(function (response) {
    if (response.status === 200) {
      callback();
    } else {
      callback("Something went wrong");
    }
  });
}
function addTodoToDOM(todo,iscompleted) {
  const todoList = document.getElementById("todo-list");
  const todoItem = document.createElement("li");
  const todolabel = document.createElement("label");
  todolabel.innerText = todo;
  const crosslabel = document.createElement("label");
  crosslabel.innerText = "X";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value="false";
  if (iscompleted) {
    todolabel.style.textDecoration = "line-through";
    checkbox.value = "true";
    checkbox.checked =true;
  } else {
    todolabel.style.textDecoration = "none";
    checkbox.value = "false";
  }
  todoItem.appendChild(todolabel);
  todoItem.appendChild(checkbox);
  todoItem.appendChild(crosslabel);
  todoList.appendChild(todoItem);

  checkbox.addEventListener("change", function () {
    if (checkbox.value =="false"){
      todolabel.style.textDecoration = "line-through";
      checkbox.value = true;
    } else {
      todolabel.style.textDecoration = "none";
      checkbox.value = false;
    }
    changeStatus(todo, function (error) {
      if (error) {
        alert(error);
      }
    });
  });
  crosslabel.addEventListener("click", function () {
    deleteTodo(todo, function (error) {
      if (error) {
        alert(error);
      } else {
        todoList.removeChild(todoItem);
      }
    });
  });
}

function getTodos() {
  fetch("/todos?name=" + userName)
    .then(function (response) {
      if (response.status !== 200) {
        throw new Error("Something went wrong");
      }
      return response.json();
    })
    .then(function (todos) {
      todos.forEach(function (todo) {
        addTodoToDOM(todo.text,todo.iscompleted);
      });
    })
    .catch(function (error) {
      alert(error);
    });
}


async function getUser() {
  try {
    const response = await fetch("/user");
    if (response.status !== 200) {
      throw new Error("Something went wrong");
    }
    const user = await response.json();
    return user;
  } catch (error) {
    alert(error);
  }
}
function changeStatus(todo, callback) {
  fetch("/change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: todo, createdBy: userName }),
  }).then(function (response) {
    if (response.status === 200) {
      callback();
    } else {
      callback("Something went wrong");
    }
  });
}
function deleteTodo(todo, callback) {
  fetch("/todo", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: todo, createdBy: userName }),
  }).then(function (response) {
    if (response.status === 200) {
      callback();
    } else {
      callback("Something went wrong");
    }
  });
}