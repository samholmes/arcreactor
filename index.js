export default class Reactor {
	constructor(expression) {
		this._state = undefined
		this.expression = undefined
		this.descendants = []
		this.ancestors = []
		this.define(expression)
	}

	/**
	 * A static method that returns the tracked array while deleting the static
	 * property.
	 *
	 * @return {array} - An array of tracked reactors.
	 */
	static wipeTracks() {
		let tracked = this.tracked
		delete this.tracked
		return tracked
	}

	/**
	 * Getter/Setter methods that wrap retrieve and define respectively.
	 */

	get state() {
		return this.retrieve()
	}
	set state(expression) {
		this.define(expression)
		return this
	}

	/**
	 * Set the reactor's expression and updates the reactor initiating change
	 * propagation.
	 *
	 * @param  {any} expression – a value or function to keep internally for updates
	 * @return {undefined}
	 */
	define(expression) {
		this.expression = expression
		this.update()
	}

	/**
	 * Retreives the reactor's state while
	 * updating the tracked reactor set.
	 *
	 * @return {any} – The current state of the reactor.
	 */
	retrieve() {
		if (Reactor.tracked) {
			Reactor.tracked.push(this)
		}

		return this._state
	}

	/**
	 * Updates the reactor's state by invoking it's internal expression
	 * while dynamically reorganizing the reactor in the graph.
	 *
	 * @return undefined
	 */
	update() {
		// Detach reactor from it's ancestors in the graph
		// by removing itself as a descendant for each of it's ancestors.
		this.ancestors.forEach(ancestor => ancestor.removeDescendant(this))

		// Reset the tracked reactor set
		Reactor.tracked = []

		// Execute expression and update the internal state
		this._state =
			typeof this.expression === 'function'
				? this.expression()
				: this.expression

		// Set its ancestors from the tracked reactors
		this.ancestors = Reactor.wipeTracks()

		// Invoke the each reactor's descendant update method.
		// This allows the change to propagate through the graph.
		if (this.descendants) {
			this.descendants.forEach(descendant => descendant.update())
		}

		// Attach reactor to the graph using the ancestors returned.
		// Effectively, re-attaching the updated symbol to the graph
		if (this.ancestors) {
			this.ancestors.forEach(ancestor => ancestor.addDescendant(this))
		}
	}

	/**
	 * Methods to add/remove descendants to the reactor instance.
	 * These methods guarantee no duplicates.
	 */

	addDescendant(reactor) {
		if (!this.descendants.includes(reactor)) {
			this.descendants.push(reactor)
		}
	}
	removeDescendant(reactor) {
		this.descendants = this.descendants.filter(
			descendant => descendant !== reactor
		)
	}
}
