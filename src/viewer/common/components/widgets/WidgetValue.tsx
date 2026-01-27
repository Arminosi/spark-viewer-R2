import useContextWithOverride from '../../hooks/useContextWithOverride';
import { Formatter, WidgetFormatter } from './format';
import { useLanguage } from '../../../../i18n';

export interface WidgetValueProps {
    value: number;
    label: string;
    formatter?: Formatter;
}

export default function WidgetValue({
    value,
    label,
    formatter,
}: WidgetValueProps) {
    const { color, format } = useContextWithOverride(
        WidgetFormatter,
        formatter
    );

    const { t } = useLanguage();
    const translateIfExists = (key: string, fallback: string) => {
        const v = t(key);
        return v === key ? fallback : v;
    };
    const translatedLabel = translateIfExists(`viewer.widgetLabels.${label}`, label);

    return (
        <div className="widget-value">
            <div style={{ color: color(value, 1) }}>{format(value)}</div>
            <div>{translatedLabel}</div>
        </div>
    );
}
