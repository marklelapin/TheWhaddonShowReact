import React, { useEffect, useRef } from 'react';

export function ElementInViewObserver({ children, onEnterView, onExitView }) {
    const targetRef = useRef(null);

    useEffect(() => {
        const target = targetRef.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onEnterView && onEnterView(entry.target);
                    } else {
                        onExitView && onExitView(entry.target);
                    }
                });
            },
            { threshold: 0 } // Adjust threshold as needed
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [onEnterView, onExitView]);

    return <div ref={targetRef}>{children}</div>;
}