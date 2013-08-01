/*jshint esnext:true */

// Todo Model
// ----------

// Our basic **Todo** model has `content`, `order`, and `done` attributes.
class Todo extends Backbone.Model {

	// Default attributes for the todo.
	defaults() {
		return {
			content: '',
			done: false
		};
	}

	// Ensure that each todo created has `content`.
	initialize() {
		if (!this.get('content')) {
			this.set({ content: this.defaults().content });
		}
	}

	// Toggle the `done` state of this todo item.
	toggle() {
		this.save({ done: !this.get('done') });
	}

	// Remove this Todo from *localStorage* and delete its view.
	clear() {
		this.destroy();
	}

}


// Todo Collection
// ---------------

// The collection of todos is backed by *localStorage* instead of a remote
// server.
class TodoList extends Backbone.Collection {

	constructor(options) {
		// Reference to this collection's model.
		this.model = Todo;

		// Save all of the todo items under the `'todos'` namespace.
		this.localStorage = new Backbone.LocalStorage('todos-traceur-backbone');

		super(options);
	}

	// Filter down the list of all todo items that are finished.
	done() {
		return this.filter((todo) => todo.get('done'));
	}

	// Filter down the list to only todo items that are still not finished.
	remaining() {
		return this.without.apply(this, this.done());
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

// Todo Item View
// --------------

// The DOM element for a todo item...
class TodoView extends Backbone.View {

	constructor (options) {
		//... is a list tag.
		this.tagName = 'li';

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.

		this.model = Todo;

		// Cache the template function for a single item.
		this.template = _.template($('#item-template').html());

		this.ENTER_KEY = 13;

		this.input = '';

		// The DOM events specific to an item.
		this.events = {
			'click .check': 'toggleDone',
			'dblclick label.todo-content': 'edit',
			'click button.destroy': 'clear',
			'keypress .todo-input': 'updateOnEnter',
			'blur .todo-input': 'close'
		};

		super(options);

		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);

	}

	// Re-render the contents of the todo item.
	render() {
		this.$el.html(this.template(this.model.toJSON()));
		this.input = this.$('.todo-input');
		return this;
	}

	// Toggle the `'done'` state of the model.
	toggleDone() {
		this.model.toggle();
	}

	// Switch this view into `'editing'` mode, displaying the input field.
	edit() {
		this.$el.addClass('editing');
		this.input.focus();
	}

	// Close the `'editing'` mode, saving changes to the todo.
	close() {
		this.model.save({ content: this.input.val() });
		this.$el.removeClass('editing');
	}

	// If you hit `enter`, we're through editing the item.
	updateOnEnter(e) {
		if (e.which === TodoView.ENTER_KEY) {
			close();
		}
	}

	// Remove the item, destroy the model.
	clear() {
		this.model.clear();
	}

}

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
class AppView extends Backbone.View {

	constructor () {


		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		this.setElement($('#todoapp'), true);

		// Delegated events for creating new items, and clearing completed ones.
		this.events = {
			'keypress #new-todo': 'createOnEnter',
			'click .todo-clear button': 'clearCompleted',
			'click .mark-all-done': 'toggleAllComplete'
		};


		// At initialization we bind to the relevant events on the `Todos`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting todos that might be saved in *localStorage*.

		this.input = this.$('#new-todo');
		this.allCheckbox = this.$('.mark-all-done')[0];
		this.mainElement = this.$('#main')[0];
		this.footerElement = this.$('#footer')[0];
		this.statsTemplate = _.template($('#stats-template').html());

		this.listenTo(Todos, 'add', this.addOne);
		this.listenTo(Todos, 'reset', this.addAll);
		this.listenTo(Todos, 'all', this.render);


		Todos.fetch();

		super();
	}

	// Re-rendering the App just means refreshing the statistics -- the rest
	// of the app doesn't change.
	render() {
		var done = Todos.done().length;
		var remaining = Todos.remaining().length;

		if (Todos.length) {
			this.mainElement.style.display = 'block';
			this.footerElement.style.display = 'block';

			this.$('#todo-stats').html(this.statsTemplate({
				total: Todos.length,
				done: done,
				remaining: remaining
			}));
		} else {
			this.mainElement.style.display = 'none';
			this.footerElement.style.display = 'none';
		}

		this.allCheckbox.checked = !remaining;
	}

	// Add a single todo item to the list by creating a view for it, and
	// appending its element to the `<ul>`.
	addOne(todo) {
		var view = new TodoView({ model: todo });
		this.$('#todo-list').append(view.render().el);
	}

	// Add all items in the **Todos** collection at once.
	addAll() {
		//Todos.each(this.addOne);
		this.$('#todo-list').html('');
		Todos.each(this.addOne, this);
	}

	// Generate the attributes for a new Todo item.
	newAttributes() {
		return {
			content: this.input.val(),
			order: Todos.nextOrder(),
			done: false
		};
	}

	// If you hit return in the main input field, create new **Todo** model,
	// persisting it to *localStorage*.
	createOnEnter(e) {
		if (e.which !== 13) {
			return;
		}

		Todos.create(this.newAttributes());
		this.input.val('');
	}

	// Clear all done todo items, destroying their models.
	clearCompleted() {
		_.each(Todos.done(), (todo) => todo.clear());
		return false;
	}

	toggleAllComplete() {
		var done = this.allCheckbox.checked;
		Todos.each((todo) => todo.save({ 'done': done }));
	}

}

// Load the application once the DOM is ready, using `jQuery.ready`:
$(() => {
	// Finally, we kick things off by creating the **App**.
	new AppView();
});
