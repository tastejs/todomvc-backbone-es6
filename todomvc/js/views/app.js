
// The Application
// ---------------

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


