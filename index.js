const mongo = require("mongodb");

const client = new mongo.MongoClient("mongodb://localhost:27017", {
  useNewUrlParser: true
  //   useUnifiedTopology: true
});

function addNewtoDo(todosCollection, title) {
  todosCollection.insertOne(
    {
      title,
      done: false
    },
    err => {
      if (err) {
        console.log("Błąd podczas dodawania: ", err);
      } else {
        console.log("Zadanie dodane prawidłowo");
      }
      client.close();
    }
  );
}

function showAll(todosCollection) {
  todosCollection.find({}).toArray((err, todos) => {
    if (err) {
      console.log("Błąd podczas listowania: ", err);
    } else {
      const todosToDo = todos.filter(todo => !todo.done);
      const todosDone = todos.filter(todo => todo.done);

      console.log(
        `Lista zadań do zrobienia (niezakończone): ${todosToDo.length}`
      );

      for (const todo of todosToDo) {
        console.log(`- ${todo._id} ${todo.title}`);
      }

      console.log(`Lista zadań zrobionych (zakończone): ${todosDone.length}`);

      for (const todo of todosDone) {
        console.log(`- ${todo._id} ${todo.title}`);
      }
    }
    client.close();
  });
}

function deleteTask(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id)
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("Błąd podczas pobierania ");
      } else if (todos.length !== 1) {
        console.log("Nie ma takiego zadania!");
        client.close();
      } else {
        todosCollection.deleteOne(
          {
            _id: mongo.ObjectID(id)
          },
          err => {
            if (err) {
              console.log("Błąd podczas usuwania: ", err);
            } else {
              console.log("Zadanie usunięte");
            }
            client.close();
          }
        );
      }
    });
}

function deleteAllDoneTask(todosCollection) {
  todosCollection.deleteMany(
    {
      done: true
    },
    err => {
      if (err) {
        console.log("Błąd podczas usuwania: ", err);
      } else {
        console.log("Wyczyszczono zakończone zadania");
      }
      client.close();
    }
  );
}

function markTaskAsDone(todosCollection, id) {
  todosCollection
    .find({
      _id: mongo.ObjectID(id)
    })
    .toArray((err, todos) => {
      if (err) {
        console.log("Błąd podczas pobierania ");
      } else if (todos.length !== 1) {
        console.log("Nie ma takiego zadania!");
        client.close();
      } else if (todos[0].done) {
        console.log("To zadanie było już zakończone!");
        client.close();
      } else {
        todosCollection.updateOne(
          {
            _id: mongo.ObjectID(id)
          },
          {
            $set: {
              done: true
            }
          },
          err => {
            if (err) {
              console.log(
                "Błąd podczas ustawiania zadania jako zakończone: ",
                err
              );
            } else {
              console.log("Zadanie ustawione jako zakończone");
            }
            client.close();
          }
        );
      }
    });
}

function doTheToDo(todosCollection) {
  const [command, ...args] = process.argv.splice(2);

  switch (command) {
    case "add":
      addNewtoDo(todosCollection, args[0]);
      break;
    case "list":
      showAll(todosCollection);
      break;
    case "done":
      markTaskAsDone(todosCollection, args[0]);
      break;
    case "delete":
      deleteTask(todosCollection, args[0]);
      break;
    case "cleanup":
      deleteAllDoneTask(todosCollection);
      break;
    default:
      console.log(`
      ### Lista TO DO - oparta na MongoDB ###

      Dostępne komendy:
      add <nazwa zadania> - dodaje nazwę do wykonania
      list - wyświetl zadania
      done <id zadania> - oznacz wybrane zadanie jako wykonane
      remove <id zadania> - usuń wybrane zadanie
      cleanup - usunięcie wykonanych zadań`);
      client.close();
      break;
  }
}

client.connect(err => {
  if (err) {
    console.log("Błąd połączenie", err);
  } else {
    console.log("Połączono");

    const db = client.db("test");
    const todosCollection = db.collection("todos");

    doTheToDo(todosCollection);
  }
});
