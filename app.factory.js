app.factory('indexedDBDataSvc', function ($window, $q) {
  var indexedDB = $window.indexedDB;
  var db = null;
  var lastIndex = 0;

  var open = function () {
    var deferred = $q.defer();
    var version = 1;
    var request = indexedDB.open("todoData", version);

    request.onupgradeneeded = function (e) {
      db = e.target.result;

      e.target.transaction.onerror = indexedDB.onerror;

      if (db.objectStoreNames.contains("todo")) {
        db.deleteObjectStore("todo");
      }

      var store = db.createObjectStore("todo", {
        keyPath: "id"
      });
    };

    request.onsuccess = function (e) {
      db = e.target.result;
      deferred.resolve();
    };

    request.onerror = function () {
      deferred.reject();
    };

    return deferred.promise;
  };

  var getTodos = function () {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("IndexDB is not opened yet!");
    } else {
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      var todos = [];

      // Get everything in the store;
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);

      cursorRequest.onsuccess = function (e) {
        var result = e.target.result;
        if (result === null || result === undefined) {
          deferred.resolve(todos);
        } else {
          todos.push(result.value);
          if (result.value.id > lastIndex) {
            lastIndex = result.value.id;
          }
          result.
            continue();
        }
      };

      cursorRequest.onerror = function (e) {
        console.log(e.value);
        deferred.reject("Something went wrong!!!");
      };
    }

    return deferred.promise;
  };

  var deleteTodo = function (id) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("IndexDB is not opened yet!");
    } else {
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");

      var request = store.delete(id);

      request.onsuccess = function (e) {
        deferred.resolve();
      };

      request.onerror = function (e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be deleted");
      };
    }

    return deferred.promise;
  };

  var addTodo = function (orignalImage, cropImage) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("IndexDB is not opened yet!");
    } else {
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      lastIndex++;
      var request = store.put({
        "id": lastIndex,
        "originalImage": orignalImage,
        "cropImage": cropImage
      });

      request.onsuccess = function (e) {
        deferred.resolve();
      };

      request.onerror = function (e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be added!");
      };
    }
    return deferred.promise;
  };


  var updateResult = function (id, updateImage) {
    var deferred = $q.defer();
    if (db === null) {
      deferred.reject("IndexDB is not opened yet!");
    } else {
      var transaction = db.transaction(['todo'], 'readwrite');
      var objectStore = transaction.objectStore('todo');

      objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          if (cursor.value.id === id) {
            var updateData = cursor.value;

            updateData.cropImage = updateImage;
            console.log(updateData.id);
            var request = cursor.update(updateData);
            request.onsuccess = function () {
              deferred.resolve();
            };
          };
          cursor.continue();
        } else {
          console.log('Entries displayed.');
        }
      };
    }
    return deferred.promise;
  };

  var updateImageOfSelect = function (id, updatedImage) {
    var deferred = $q.defer();

    if (db === null) {
      deferred.reject("IndexDB is not opened yet!");
    } else {
      var trans = db.transaction(["todo"], "readwrite");
      var store = trans.objectStore("todo");
      var cursor = event.target.result;
      store.cropImage = updatedImage;
      console.log(store);
      var request = store.update(store);

      request.onsuccess = function (e) {
        deferred.resolve();
      };

      request.onerror = function (e) {
        console.log(e.value);
        deferred.reject("Todo item couldn't be deleted");
      };
    }

    return deferred.promise;
  };

  return {
    open: open,
    getTodos: getTodos,
    addTodo: addTodo,
    deleteTodo: deleteTodo,
    updateResult: updateResult,
    updateImageOfSelect: updateImageOfSelect
  };

});