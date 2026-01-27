import FilePicker from '../components/FilePicker';
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import SparkLayout from '../components/SparkLayout';
import { NextPageWithLayout, SelectedFileContext } from './_app';
import RemoteReportsModal from '../components/RemoteReportsModal';
import { useLanguage } from '../i18n';
import styles from '../style/homepage.module.scss';

const Index: NextPageWithLayout = () => {
    const { t } = useLanguage();
    const { setSelectedFile } = useContext(SelectedFileContext);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    function onFileSelected(file: File) {
        setSelectedFile(file);
        // Navigate to the viewer route which uses code '_' to load from selectedFile
        router.push('/_');
    }

    return (
        <article className={styles.homepage}>
            <div className={styles['homepage-actions']}>
                <button
                    className={styles['remote-open-button']}
                    onClick={() => setIsModalOpen(true)}
                >
                    {t('homepage.openRemoteReports')}
                </button>
            </div>

            <ViewerSection onFileSelected={onFileSelected} />

            <RemoteReportsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </article>
    );
};

const ViewerSection = ({
    onFileSelected,
}: {
    onFileSelected: (file: File) => void;
}) => {
    const { t } = useLanguage();

    return (
        <section className={styles['viewer-section']}>
            <h2>{t('homepage.viewerTitle')}</h2>
            <p className={styles.description}>{t('homepage.viewerDescription')}</p>

            <div className={styles['how-to-use']}>
                <h3>{t('homepage.howToUseTitle')}</h3>
                <ol>
                    <li>{t('homepage.step1')}</li>
                    <li>{t('homepage.step2')}</li>
                </ol>
            </div>

            <p className={styles['alternative-text']}>
                {t('homepage.alternativeMethod')} <code>.sparkprofile</code> {t('homepage.or')}{' '}
                <code>.sparkheap</code> {t('homepage.file')}
            </p>

            <FilePicker callback={onFileSelected} />
        </section>
    );
};



Index.getLayout = page => <SparkLayout>{page}</SparkLayout>;

export default Index;
