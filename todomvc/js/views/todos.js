
// Todo Item View
// --------------

// The DOM element for a todo item...
export class TodoView extends View {

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
		const isCompleted = this.model.get('completed');
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
		const value = this.input.val();

		this.$el.addClass('editing');
		this.input.val(value).focus();
	}

	// Close the `'editing'` mode, saving changes to the todo.
	close() {
		const title = this.input.val();

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

