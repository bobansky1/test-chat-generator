import pattern from './assets/telegram-pattern.svg?raw';
import type { Project } from './model';

// Inline the supplied SVG so standalone HTML and PNG exports need no server.
export function wallpaper(screen: Project['screen']) {
 if(screen.wallpaper==='plain') return 'none';
 const color=screen.theme==='dark'
  ? (screen.wallpaper==='violet'?'#705395':'#7395ad')
  : (screen.wallpaper==='sand'?'#998363':screen.wallpaper==='blue'?'#6e93ae':'#78936d');
 const svg=pattern.replace('<svg ',`<svg color="${color}" opacity="${screen.theme==='dark'?.36:.22}" `);
 return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
