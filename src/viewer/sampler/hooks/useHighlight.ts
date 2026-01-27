import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import VirtualNode from '../node/VirtualNode';

export interface Highlight {
    toggle: (node: VirtualNode) => void;
    check: (node: VirtualNode) => boolean;
    has: (node: VirtualNode) => boolean;
    clear: () => void;
    replace: (node: VirtualNode) => void;
    replaceSilently?: (node: VirtualNode) => void;
}

export default function useHighlight(): Highlight {
    const router = useRouter();
    const navigatingRef = useRef(false);
    const skipUrlRef = useRef(false);
    const [highlighted, setHighlighted] = useState(() => {
        const set = new Set<number>();
        const ids = router.query['hl'] as string;
        if (ids) {
            ids.split(',').forEach(id => set.add(parseInt(id)));
        }
        return set;
    });

    useEffect(() => {
        // Listen to route change events so we don't fight user-initiated navigation
        const handleStart = () => {
            navigatingRef.current = true;
        };
        const handleEnd = () => {
            navigatingRef.current = false;
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleEnd);
        router.events.on('routeChangeError', handleEnd);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleEnd);
            router.events.off('routeChangeError', handleEnd);
        };

    }, [router.events]);

    useEffect(() => {
        const ids = Array.from(highlighted).join(',');
        if ((!ids && !router.query.hl) || ids === router.query.hl) {
            return;
        }

        // get the current path without the query parameters
        let path = router.asPath;
        const questionMark = path.indexOf('?');
        if (questionMark >= 0) {
            path = path.substring(0, questionMark);
        }

        // Only update the URL when we're on a viewer route (prevent interfering
        // with navigation back to the homepage or other non-viewer pages).
        const isViewerRoute =
            router.pathname === '/[code]' ||
            router.pathname === '/remote' ||
            Boolean(router.query.code);
        if (!isViewerRoute) {
            return;
        }

        // If a route change is in progress, skip updating hl to avoid fighting
        // the user's navigation (this prevents the URL from being immediately
        // overwritten while clicking links).
        if (navigatingRef.current) return;

        // If a caller requested to skip the next URL update, consume the flag
        // and do not push to the router.
        if (skipUrlRef.current) {
            skipUrlRef.current = false;
            return;
        }

        // Preserve other query parameters (e.g. `path`, `remote`, `code`) when
        // adding/removing `hl` to avoid clobbering remote loads and causing a
        // push/restore loop between different pieces of code.
        const newQuery: { [k: string]: any } = { ...router.query };
        if (highlighted.size) {
            newQuery.hl = ids;
        } else {
            delete newQuery.hl;
        }

        router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
    }, [highlighted, router]);

    // Toggles the highlighted state of an id
    const toggle: Highlight['toggle'] = useCallback(
        node => {
            setHighlighted(prev => {
                const set = new Set(prev);
                if (setHas(set, node.getId())) {
                    setDelete(set, node.getId());
                } else {
                    setAdd(set, node.getId());
                }
                return set;
            });
        },
        [setHighlighted]
    );

    // Checks if a node, or one of its children is in the given highlighted set
    const check: Highlight['check'] = useCallback(
        node => {
            if (!highlighted.size) {
                return false;
            }

            if (setHas(highlighted, node.getId())) {
                return true;
            }
            for (const c of node.getChildren()) {
                if (check(c)) {
                    return true;
                }
            }
            return false;
        },
        [highlighted]
    );

    // Checks whether a node with the given id is in the highlighted set
    const has: Highlight['has'] = useCallback(
        node => setHas(highlighted, node.getId()),
        [highlighted]
    );

    // Clears all current highlights
    const clear: Highlight['clear'] = useCallback(
        () => setHighlighted(new Set()),
        [setHighlighted]
    );

    // Replaces all highlights with a single node (atomic operation, only one URL update)
    const replace: Highlight['replace'] = useCallback(
        node => {
            const newSet = new Set<number>();
            setAdd(newSet, node.getId());
            setHighlighted(newSet);
        },
        [setHighlighted]
    );

    const replaceSilently: Highlight['replaceSilently'] = useCallback(
        node => {
            const newSet = new Set<number>();
            setAdd(newSet, node.getId());
            // Mark to skip URL update on next effect run
            skipUrlRef.current = true;
            setHighlighted(newSet);
        },
        [setHighlighted]
    );

    return { toggle, check, has, clear, replace, replaceSilently };
}

// some functions for sets which accept either 'value' or '[value1, value2]' parameters
const setMultiOp =
    (func: (set: Set<number>, value: number) => boolean) =>
    (set: Set<number>, value: number | number[]): boolean => {
        if (Array.isArray(value)) {
            for (const el of value) {
                if (func(set, el)) {
                    return true;
                }
            }
            return false;
        } else {
            return func(set, value);
        }
    };

const setHas = setMultiOp((set, v) => set.has(v));
const setAdd = setMultiOp((set, v) => {
    set.add(v);
    return false;
});
const setDelete = setMultiOp((set, v) => {
    set.delete(v);
    return false;
});
