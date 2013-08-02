
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

