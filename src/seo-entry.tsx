import React from 'react';
import {renderToString} from 'react-dom/server';
import Landing from './Landing';
import Blog from './Blog';
export {pageMeta,publicPaths} from './seo';
export function render(path:string){return renderToString(path==='/'?<Landing/>:<Blog slug={path==='/404'?'not-found':path.split('/')[2]}/>);}
