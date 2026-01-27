import { ReactNode } from 'react';
import { useLanguage } from '../../../../i18n';
import { Formatter, WidgetFormat, WidgetFormatter } from './format';

export interface WidgetProps {
    title: string;
    label?: string;
    formatter?: Formatter;
    children: ReactNode;
}

export default function Widget({
    title,
    label,
    formatter = WidgetFormat.defaultFormatter,
    children,
}: WidgetProps) {
    const { t } = useLanguage();
    const translateIfExists = (key: string, fallback: string) => {
        const v = t(key);
        return v === key ? fallback : v;
    };

    const localizedTitle = translateIfExists(`viewer.widgets.${title}`, title);
    const localizedLabel = label ? translateIfExists(`viewer.widgetLabels.${label}`, label) : undefined;
    return (
        <div className={`widget widget-${title.toLowerCase()}`}>
            <h1>
                {localizedTitle}
                {localizedLabel && <span>({localizedLabel})</span>}
            </h1>
            <div className="widget-values">
                <WidgetFormatter.Provider value={formatter}>
                    {children}
                </WidgetFormatter.Provider>
            </div>
        </div>
    );
}
