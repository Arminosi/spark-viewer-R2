import FilePicker from '../components/FilePicker';
import { useState, useContext } from 'react';
import SparkLayout from '../components/SparkLayout';
import { NextPageWithLayout, SelectedFileContext } from './_app';
import RemoteReportsModal from '../components/RemoteReportsModal';
import styles from '../style/homepage.module.scss';

const Index: NextPageWithLayout = () => {
    const { setSelectedFile } = useContext(SelectedFileContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function onFileSelected(file: File) {
        setSelectedFile(file);
        // viewer route is handled elsewhere; keep simple here
    }

    return (
        <article className={styles.homepage}>
            <div className={styles['homepage-actions']}>
                <button
                    className={styles['remote-open-button']}
                    onClick={() => setIsModalOpen(true)}
                >
                    打开远程报告
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
    return (
        <section>
            <h2>Viewer</h2>
            <p>This website is also an online viewer for spark data.</p>
            <p>In order to use it:</p>
            <ol>
                <li>
                    Generate a profile or heap summary using the appropriate
                    spark commands, then load the resulting file here.
                </li>
                <li>
                    After the data has been uploaded, open the viewer from the
                    viewer UI.
                </li>
            </ol>
            <p>
                You can also generate or export a <code>.sparkprofile</code> or{' '}
                <code>.sparkheap</code> file and open it by dragging it into the
                box below.
            </p>
            <FilePicker callback={onFileSelected} />
        </section>
    );
};



Index.getLayout = page => <SparkLayout>{page}</SparkLayout>;

export default Index;
