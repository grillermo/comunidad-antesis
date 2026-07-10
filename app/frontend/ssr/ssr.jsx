import createServer from '@inertiajs/react/server'
import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.jsx')
      return pages[`../pages/${name}.jsx`]()
    },
    setup: ({ App, props }) => <App {...props} />,
  }),
)
