/**
 * Calls the specified factory function and handles any errors that occur during its execution.
 * If an error is thrown, it will be logged to the console using `console.error`.
 *
 * @param {() => Promise<void>} factory - The factory function to be executed.
 * @returns {Promise<void>} A promise that resolves when the factory function completes successfully or rejects with an error.
 */
export async function tryThis(factory: () => Promise<void>): Promise<void> {
	try {
		await factory();
	} catch (error) {
		console.error(error);
	}
}
