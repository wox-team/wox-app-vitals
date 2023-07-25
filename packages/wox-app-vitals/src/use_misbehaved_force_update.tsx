import { DispatchWithoutAction, useReducer } from 'react';

/**
 * There's very few cases this hook is needed. It should not really be viewed as
 * a solution, it's an escape hatch. Try to avoid this pattern if possible.
 *
 * See: https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
 */
export function useMisbehavedForceUpdate(): DispatchWithoutAction {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	return forceUpdate;
}
