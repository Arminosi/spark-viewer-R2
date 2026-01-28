import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import styles from './Panel.module.scss'; // Ensure you have this CSS module

interface PanelProps {
    title: ReactNode;
    children: ReactNode;
    className?: string; // For additional styling
    defaultExpanded?: boolean;
}

export default function Panel({
    title,
    children,
    className,
    defaultExpanded = true,
}: PanelProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={classNames(styles.panel, className)}>
            <div
                className={classNames(styles.header, { [styles.closed]: !expanded })}
                onClick={() => setExpanded(!expanded)}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.toggle}>
                    <FontAwesomeIcon
                        icon={expanded ? faChevronUp : faChevronDown}
                    />
                </div>
            </div>
            <div className={classNames(styles.content, { [styles.hidden]: !expanded })}>
                {children}
            </div>
        </div>
    );
}
