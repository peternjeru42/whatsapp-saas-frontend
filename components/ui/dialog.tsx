'use client'
import {Dialog as Primitive} from '@base-ui/react/dialog'
import {X} from 'lucide-react'
import {cn} from '@/lib/utils'
export const Dialog=Primitive.Root
export const DialogTitle=Primitive.Title
export const DialogDescription=({className,...props}:React.ComponentProps<typeof Primitive.Description>)=><Primitive.Description className={cn('text-sm text-muted-foreground',className)} {...props}/>
export function DialogHeader({children}:{children:React.ReactNode}){return <div className="dialog-header">{children}</div>}
export function DialogContent({children,className}:{children:React.ReactNode;className?:string}){return <Primitive.Portal><Primitive.Backdrop className="dialog-backdrop"/><Primitive.Popup className={cn('dialog-content',className)}>{children}<Primitive.Close className="dialog-close" aria-label="Close dialog"><X size={18}/></Primitive.Close></Primitive.Popup></Primitive.Portal>}
