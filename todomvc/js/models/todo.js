// Todo Model
// ----------

// Our basic **Todo** model has `content`, `order`, and `done` attributes.
export class Todo extends Model {

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
