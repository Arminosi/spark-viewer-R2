import classNames from 'classnames';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../i18n';

import styles from '../style/homepage.module.scss';

export interface FilePickerProps {
    callback: (file: File) => void;
}

export default function FilePicker({ callback }: FilePickerProps) {
    const { t } = useLanguage();
    const { getRootProps, getInputProps } = useDropzone({
        accept: { '': ['.sparkprofile', '.sparkheap'] },
        multiple: false,
        onDropAccepted: files => {
            callback(files[0]);
        },
    });

    return (
        <div
            {...getRootProps({
                className: classNames('textbox', styles['file-picker']),
            })}
        >
            <input {...getInputProps()} />
            <p>{t('filePicker.dragDrop')}</p>
            <em>
                {t('filePicker.onlyAccepted')} <code>.sparkprofile</code> {t('filePicker.or')} <code>.sparkheap</code>{' '}
                {t('filePicker.files')}
            </em>
        </div>
    );
}
