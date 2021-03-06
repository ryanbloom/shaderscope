import React from 'react'

export function Button(props) {
    return <button className='my-2 p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md dark:bg-slate-600 dark:hover:bg-slate-500 dark:active:bg-slate-400' {...props} >
        { props.children }
    </button>
}
