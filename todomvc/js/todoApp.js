/*jshint esnext:true */

const ENTER_KEY = 13;
const TodoFilter = '';

let { Model, View, Collection, Router, LocalStorage } = Backbone;

import { Todo } from "./models/todo.js";
import { TodoList } from "./collections/todos.js";
import { TodoView } from "./views/todos.js";
import { AppView } from "./views/app.js";
import { Filters } from "./routers/router.js";

/*
// Load the application once the DOM is ready, using `jQuery.ready`:
$(() => {
	// Finally, we kick things off by creating the **App**.
	new AppView();
	new Filters();
	Backbone.history.start();
});
*/