import React, { Fragment } from 'react'
import Link from "next/link";

const linkBase =
    'https://github.com/jquense/react-big-calendar/blob/master/stories/demos/exampleCode/'

export default function DemoLink({ fileName, children }) {
    return (
        <Fragment>
            <div style={{ marginBottom: 10 }}>
               <Link target="_blank" href={`${linkBase}${fileName}.js`}>
                   <a>
                       &lt;\&gt; View Example Source Code
                   </a>
               </Link>
            </div>
            {children ? <div style={{ marginBottom: 10 }}>{children}</div> : null}
        </Fragment>
    )
}
