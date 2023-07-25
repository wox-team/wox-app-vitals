import { useEffect } from 'react';
import { useMisbehavedForceUpdate } from './use_misbehaved_force_update';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';

test('should rerender component', () => {
	let count = 0;

	function Suit(): JSX.Element {
		const forceUpdate = useMisbehavedForceUpdate();

		useEffect(() => {
			count++;
		});

		function handleClick(): void {
			forceUpdate();
		}

		return <button onClick={handleClick}>button</button>;
	}

	render(<Suit />);

	expect(count).toBe(1);

	const button = screen.getByText('button');
	fireEvent.click(button);

	expect(count).toBe(2);
});
