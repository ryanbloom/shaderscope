import React from 'react'

export function Button(props) {
    return <button className='my-2 p-2 bg-slate-200 active:bg-slate-300 rounded-md dark:bg-slate-600 dark:active:bg-slate-500' {...props} >
        { props.children }
    </button>
}

export function MenuLink(props) {
    return <a className='block rounded-md py-2 px-4 mx-2 hover:bg-slate-200 dark:hover:bg-slate-600' {...props}>
        { props.children }
    </a>
}
