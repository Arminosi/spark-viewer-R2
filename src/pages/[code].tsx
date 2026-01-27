import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Suspense } from 'react';
import SparkLayout from '../components/SparkLayout';
import TextBox from '../components/TextBox';
import { env } from '../env';

const SparkViewer = dynamic(() => import('../viewer/SparkViewer'));

interface ViewerPageProps {
    code: string;
}

export default function ViewerPage({ code }: ViewerPageProps) {
    return (
        <>
            {code !== '_' && <ThumbnailMetaTags code={code} />}
            <Suspense
                fallback={
                    <SparkLayout>
                        <TextBox>Loading...</TextBox>
                    </SparkLayout>
                }
            >
                <SparkViewer />
            </Suspense>
        </>
    );
}

const ThumbnailMetaTags = ({ code }: ViewerPageProps) => {
    return (
        <Head>
            <title>{`spark | ${code}`}</title>
            <meta
                property="og:image"
                content={`${env.NEXT_PUBLIC_SPARK_BASE_URL}/thumb/${code}.png`}
                key="og-image"
            />
            <meta
                name="twitter:image"
                content={`${env.NEXT_PUBLIC_SPARK_BASE_URL}/thumb/${code}.png`}
                key="twitter-image"
            />
            <meta
                name="twitter:card"
                content="summary_large_image"
                key="twitter-card"
            />
        </Head>
    );
};
