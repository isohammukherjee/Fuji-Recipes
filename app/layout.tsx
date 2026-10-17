import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fuji Recipes — Your field companion',description:'A personal collection of Fujifilm recipes. Find your color, dial it in, and go make something.',icons:{icon:'/favicon.svg'},manifest:'/manifest.webmanifest'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#111311'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
