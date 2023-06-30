import Head from 'next/head'

export default function Heads(props) {
    return (
        <div>
            <Head>
                <title>{props.title}</title>
                <meta property="og:title" content="My page title" key="title"/>
            </Head>
            <Head>
                <meta property="og:title" content="My new title" key="title"/>
            </Head>
        </div>
    );
}
