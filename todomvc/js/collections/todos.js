// Todo Collection
// ---------------

// The collection of todos is backed by *localStorage* instead of a remote
// server.
class TodoList extends Collection {

	constructor(options) {
		super(options);

		// Reference to this collection's model.
		this.model = Todo;

		// Save all of the todo items under the `'todos'` namespace.
		this.localStorage = new LocalStorage('todos-traceur-backbone');
	}

	// Filter down the list of all todo items that are finished.
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

export { TodoList };