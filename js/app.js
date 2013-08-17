/*jshint esnext:true */

// Constant definitions (`const`) are block scoped, but their values are read-only.
// This means they cannot be re-declared later, which is fine in this case
// as we won't need to change these Backbone core component definitions.

const { Model, View, Collection, Router, LocalStorage } = Backbone;

// We are also taking advantage of a pattern known as "destructuring" here.
// This allows us to initialize variables in one step without having to create
// any temporary variables. Destructuring has allowed us to set Model, View and
// so on as constants so we can just extend those more literally rather than
// having to use the more classic Backbone.Model. 
 
// TodoApp module
// ---------------

// ES6 modules allow us to define isolated blocks of reusable code without 
// having to wrap it into an object or closure. Only those functions and
// variables we've explicitly 'export'ed are available to other consumers
// and we can just as easily 'import' functionality from other modules.
// It's possible to rename exported values, define modules that are inline
// and even declare defaults for import/export.

module TodoApp {

	const ENTER_KEY = 13;
	const TodoFilter = '';

	// In OOP languages, classes represent objects. In JavaScript, we've relied on
	// prototypal inheritance anytime we've needed a class-like system, but ES6
	// changes that. It's minimal class syntax makes defining classes much more 
	// terse, but desugars to prototypal inheritance behind the scenes.
	// We use the extend keyword to implement a new sub-class from the base-class.

	// Todo Model class
	// ----------------

	// Our basic **Todo** model has `title` and `completed` attributes.
	class Todo extends Model {

		// Note the omission of the 'function' keyword as in ES6 it is entirely optional
		// Default attributes for the todo.
		defaults() {
			return {
				title: '',
				completed: false
			};
		}

		// Toggle the `completed` state of this todo item.
		toggle() {
			this.save({
				completed: !this.get('completed')
			});
		}
	}


	// TodoList Collection class
	// -------------------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	class TodoList extends Collection {

		// Specifying a constructor lets us define the class constructor. Use of the
		// super keyword in your constructor lets you call the constructor of a parent
		// class so that it can inherit all of its properties.

		constructor(options) {
			super(options);

			// Reference to this collection's model.
			this.model = Todo;

			// Save all of the todo items under the `'todos'` namespace.
			this.localStorage = new LocalStorage('todos-traceur-backbone');
		}

		// Filter down the list of all todo items that are finished.
		// The fat-arrow (=>) below is shorthand syntax for an anonymous function
		// which returns a value. It also doesn't require the function keyword
		// and the parens are option when there's a single parameter being used.
		// The value of this is bound to it's containing scope, automatically 
		// returning the value of the expression that follows the fat arrow.

		completed() {
			return this.filter(todo => todo.get('completed'));
		}

		// Filter down the list to only todo items that are still not finished.
		remaining() {
			return this.without(...this.completed());
		}

		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		nextOrder() {
			if (!this.length) {
				return 1;
			}

			return this.last().get('order') + 1;
		}

		// Todos are sorted by their original insertion order.
		comparator(todo) {
			return todo.get('order');
		}
	}

	// Create our global collection of **Todos**.
	var Todos = new TodoList();

	// Todo Item View class
	// --------------------

	// The DOM element for a todo item...
	class TodoView extends View {

		constructor(options) {
			//... is a list tag.
			this.tagName = 'li';

			// The TodoView listens for changes to its model, re-rendering. Since there's
			// a one-to-one correspondence between a **Todo** and a **TodoView** in this
			// app, we set a direct reference on the model for convenience.

			this.model = Todo;

			// Cache the template function for a single item.
			this.template = _.template($('#item-template').html());

			this.input = '';

			// The DOM events specific to an item.
			this.events = {
				'click .toggle': 'toggleCompleted',
				'dblclick label': 'edit',
				'click .destroy': 'clear',
				'keypress .edit': 'updateOnEnter',
				'blur .edit': 'close'
			};

			super(options);

			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'visible', this.toggleVisible);

		}

		// Re-render the contents of the todo item.
		render() {
			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('completed', this.model.get('completed'));
			this.toggleVisible();
			this.input = this.$('.edit');
			return this;
		}

		toggleVisible() {
			this.$el.toggleClass('hidden', this.isHidden);
		}

		get isHidden() {
			var isCompleted = this.model.get('completed');
			return (// hidden cases only
				(!isCompleted && TodoFilter === 'completed') ||
				(isCompleted && TodoFilter === 'active')
			);
		}

		// Toggle the `"completed"` state of the model.
		toggleCompleted() {
			this.model.toggle();
		}

		// Switch this view into `'editing'` mode, displaying the input field.
		edit() {
			var value = this.input.val();

			this.$el.addClass('editing');
			this.input.val(value).focus();
		}

		// Close the `'editing'` mode, saving changes to the todo.
		close() {
			var title = this.input.val();

			if (title) {
				this.model.save({ title });
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');
		}

		// If you hit `enter`, we're through editing the item.
		updateOnEnter(e) {
			if (e.which === ENTER_KEY) {
				this.close();
			}
		}

		// Remove the item, destroy the model.
		clear() {
			this.model.destroy();
		}
	}

	// The Application class
	// ---------------------

	// Our overall **AppView** is the top-level piece of UI.
	export class AppView extends View {

		constructor() {

			// Instead of generating a new element, bind to the existing skeleton of
			// the App already present in the HTML.
			this.setElement($('#todoapp'), true);

			this.statsTemplate = _.template($('#stats-template').html()),

			// Delegated events for creating new items, and clearing completed ones.
			this.events = {
				'keypress #new-todo': 'createOnEnter',
				'click #clear-completed': 'clearCompleted',
				'click #toggle-all': 'toggleAllComplete'
			};

			// At initialization we bind to the relevant events on the `Todos`
			// collection, when items are added or changed. Kick things off by
			// loading any preexisting todos that might be saved in *localStorage*.
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');

			this.listenTo(Todos, 'add', this.addOne);
			this.listenTo(Todos, 'reset', this.addAll);
			this.listenTo(Todos, 'change:completed', this.filterOne);
			this.listenTo(Todos, 'filter', this.filterAll);
			this.listenTo(Todos, 'all', this.render);

			Todos.fetch();

			super();
		}

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render() {
			const completed = Todos.completed().length;
			const remaining = Todos.remaining().length;

			if (Todos.length) {
				this.$main.show();
				this.$footer.show();

				this.$footer.html(
					this.statsTemplate({
						completed, remaining
					})
				);

				this.$('#filters li a')
					.removeClass('selected')
					.filter('[href="#/' + (TodoFilter || '') + '"]')
					.addClass('selected');
			} else {
				this.$main.hide();
				this.$footer.hide();
			}

			this.allCheckbox.checked = !remaining;
		}

		// Add a single todo item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne(model) {
			const view = new TodoView({ model });
			$('#todo-list').append(view.render().el);
		}

		// Add all items in the **Todos** collection at once.
		addAll() {
			this.$('#todo-list').html('');
			Todos.each(this.addOne, this);
		}

		filterOne(todo) {
			todo.trigger('visible');
		}

		filterAll() {
			Todos.each(this.filterOne, this);
		}

		// Generate the attributes for a new Todo item.
		newAttributes() {
			return {
				title: this.$input.val().trim(),
				order: Todos.nextOrder(),
				completed: false
			};
		}

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter(e) {
			if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
				return;
			}

			Todos.create(this.newAttributes());
			this.$input.val('');
		}

		// Clear all completed todo items, destroying their models.
		clearCompleted() {
			_.invoke(Todos.completed(), 'destroy');
			return false;
		}

		toggleAllComplete() {
			const completed = this.allCheckbox.checked;
			Todos.each(todo => todo.save({ completed }));
		}
	}

	// The Filters Router class
	// ------------------------

	export class Filters extends Router {

		constructor() {
			this.routes = {
				'*filter': 'filter'
			}

			this._bindRoutes();
		}

		filter(param) {
			// Set the current filter to be used
			TodoFilter = param || '';

			// Trigger a collection filter event, causing hiding/unhiding
			// of Todo view items
			Todos.trigger('filter');
		}
	}
}

 
// Importing from a module
// -----------------------

// We import the classes we defined in the TodoApp module using the 'import' 
// keyword. Typically, you would store this module in it's own separate file
// and import it from there instead.

import { AppView, Filters } from TodoApp;

 
// Document ready
// ---------------

// Load the application once the DOM is ready, using `jQuery.ready`:
$(() => {
	// Finally, we kick things off by creating the **App**.
	new AppView();
	new Filters();
	Backbone.history.start();
});
