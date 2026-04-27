import { Link } from "@inertiajs/react";


export default function Pagination({links}){
    return(
        <div className="flex gap-2  justify-end">
            {links.map((link, index) => (
                link.url ? (
                    <Link 
                        key={index}
                        href={link.url}
                        dangerouslySetInnerHTML={{__html: link.label}}
                        className={`px-3 py-1 border ${link.active ? 'bg-blue-500 text-white' : ''}`}
                    />
                ):(
                    <span 
                        key={index}
                        dangerouslySetInnerHTML={{__html: link.label}}
                        className="px-3 py-1 border opacity-50"
                    />
                )
            ))}
        </div>
    )
}