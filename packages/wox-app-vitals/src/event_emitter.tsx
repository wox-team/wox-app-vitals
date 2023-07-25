// Reason: The internals of the event emitter needs to work with any boxed value.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type EventHandler<T> = (event: T) => void;

export type Disposer = () => void;

type ErrorHandler = (error: unknown) => void;

export class EventEmitter<T extends Record<string, any>> {
	readonly #events: { [key in keyof T]: EventHandler<any>[] } = Object.create(null);
	readonly #errorHandlers = new WeakMap<EventHandler<any>, ErrorHandler>();

	/**
	 * Registers handlers for events emitted by this instance.
	 */
	public on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Disposer;
	public on<K extends keyof T>(event: K, handler: EventHandler<T[K]>, errorHandler: ErrorHandler): Disposer;
	public on<K extends keyof T>(event: K, handler: EventHandler<T[K]>, errorHandler?: ErrorHandler): Disposer {
		(this.#events[event] || (this.#events[event] = [])).push(handler);

		if (errorHandler) {
			this.#errorHandlers.set(handler, errorHandler);
		}

		return () => {
			this.off(event, handler);
		};
	}

	/**
	 * Un-registers handlers for events emitted by this instance.
	 */
	public off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
		if (!this.#events[event]) return;

		this.#events[event].splice(this.#events[event].indexOf(handler) >>> 0, 1);
	}

	/**
	 * Emits an event containing a given value.
	 */
	public emit<K extends keyof T>(event: K, data: T[K]): void {
		(this.#events[event] || []).forEach((handler) => {
			try {
				handler(data);
			} catch (error: unknown) {
				const errorHandler = this.#errorHandlers.get(handler);
				if (errorHandler) errorHandler(error);
			}
		});
	}
}
