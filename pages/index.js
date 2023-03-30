import Head from 'next/head';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';

const XMLDropzone = dynamic(() => import('../components/XMLDropzone.js'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default function Home() {
  const handledOnFileLoaded = (xmlParse) => {
    console.log('Data', xmlParse);
  };

  return (
    <div className={styles.container}>
      <XMLDropzone onFileLoaded={handledOnFileLoaded} />
    </div>
  );
}
