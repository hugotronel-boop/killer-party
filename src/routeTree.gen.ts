/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as DefisRouteImport } from './routes/defis'
import { Route as ReglesRouteImport } from './routes/regles'
import { Route as PCodeRouteImport } from './routes/p.$code'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const DefisRoute = DefisRouteImport.update({ id: '/defis', path: '/defis', getParentRoute: () => rootRouteImport } as any)
const ReglesRoute = ReglesRouteImport.update({ id: '/regles', path: '/regles', getParentRoute: () => rootRouteImport } as any)
const PCodeRoute = PCodeRouteImport.update({ id: '/p/$code', path: '/p/$code', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/defis': typeof DefisRoute
  '/regles': typeof ReglesRoute
  '/p/$code': typeof PCodeRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/defis': typeof DefisRoute
  '/regles': typeof ReglesRoute
  '/p/$code': typeof PCodeRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/defis': typeof DefisRoute
  '/regles': typeof ReglesRoute
  '/p/$code': typeof PCodeRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/defis' | '/regles' | '/p/$code'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/defis' | '/regles' | '/p/$code'
  id: '__root__' | '/' | '/defis' | '/regles' | '/p/$code'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DefisRoute: typeof DefisRoute
  ReglesRoute: typeof ReglesRoute
  PCodeRoute: typeof PCodeRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/defis': { id: '/defis'; path: '/defis'; fullPath: '/defis'; preLoaderRoute: typeof DefisRouteImport; parentRoute: typeof rootRouteImport }
    '/regles': { id: '/regles'; path: '/regles'; fullPath: '/regles'; preLoaderRoute: typeof ReglesRouteImport; parentRoute: typeof rootRouteImport }
    '/p/$code': { id: '/p/$code'; path: '/p/$code'; fullPath: '/p/$code'; preLoaderRoute: typeof PCodeRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute, DefisRoute, ReglesRoute, PCodeRoute,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
