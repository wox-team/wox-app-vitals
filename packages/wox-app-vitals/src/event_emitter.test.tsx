import { test, vitest } from 'vitest';
import { EventEmitter, Disposer } from './event_emitter';

test('should call handler', () => {
	const eventEmitter = new EventEmitter<{
		onFoo: string;
	}>();

	const handler = vitest.fn();
	eventEmitter.on('onFoo', handler);
	eventEmitter.emit('onFoo', 'bar');

	expect(handler).toBeCalledTimes(1);
	expect(handler).toHaveBeenCalledWith('bar');
});

test('should remove handler', () => {
	const eventEmitter = new EventEmitter<{
		onFoo: string;
	}>();

	const handler = vitest.fn();
	eventEmitter.on('onFoo', handler);
	eventEmitter.emit('onFoo', 'bar');
	eventEmitter.off('onFoo', handler);
	eventEmitter.emit('onFoo', 'bar');

	expect(handler).toBeCalledTimes(1);
});

test('should remove handler by Disposer', () => {
	const eventEmitter = new EventEmitter<{
		onFoo: string;
	}>();

	const handler = vitest.fn();
	const disposer = eventEmitter.on('onFoo', handler);
	eventEmitter.emit('onFoo', 'bar');
	disposer();
	eventEmitter.emit('onFoo', 'bar');

	expect(handler).toBeCalledTimes(1);
});

test('should not interfere with multiple handlers', () => {
	const eventEmitter = new EventEmitter<{
		onFoo: string;
		onBar: number;
	}>();
	const handler = vitest.fn();
	const disposers: Disposer[] = [];

	{
		const disposer = eventEmitter.on('onFoo', handler);
		const _ = eventEmitter.on('onFoo', handler);
		disposers.push(disposer);
	}

	{
		const disposer = eventEmitter.on('onBar', handler);
		const _ = eventEmitter.on('onBar', handler);
		disposers.push(disposer);
	}

	eventEmitter.emit('onFoo', 'bar');
	eventEmitter.emit('onBar', 1);
	expect(handler).toBeCalledTimes(4);

	disposers.forEach((disposer) => disposer());
	eventEmitter.emit('onFoo', 'bar');
	eventEmitter.emit('onBar', 1);
	expect(handler).toBeCalledTimes(6);
});

test('should invoke errorHandler function if an error was thrown', () => {
	const eventEmitter = new EventEmitter<{
		onFoo: string;
	}>();

	const errorHandler = vitest.fn();
	eventEmitter.on(
		'onFoo',
		() => {
			throw 'foo';
		},
		errorHandler,
	);
	eventEmitter.emit('onFoo', 'bar');

	expect(errorHandler).toBeCalledTimes(1);
	expect(errorHandler).toHaveBeenCalledWith('foo');
});
