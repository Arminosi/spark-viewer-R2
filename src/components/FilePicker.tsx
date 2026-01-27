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
        // react-dropzone requires a MIME type key; use a generic binary MIME
        // so extension matching still works for local files.
        accept: { 'application/octet-stream': ['.sparkprofile', '.sparkheap'] },
        multiple: false,
        onDropAccepted: files => {
            callback(files[0]);
        },
        onDropRejected: rejected => {
            // Log rejected files for debugging
            // eslint-disable-next-line no-console
            console.warn('Rejected files', rejected);
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
