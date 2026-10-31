import { useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
const variants = cva('inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50 min-h-10 px-4', { variants: { variant: { default: 'bg-indigo-600 text-white hover:bg-indigo-700', outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50', ghost: 'text-slate-600 hover:bg-slate-100', danger: 'bg-red-50 text-red-700 hover:bg-red-100' } }, defaultVariants: { variant: 'default' } });
export function Button({ className, variant, asChild, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants> & { asChild?: boolean }) { const Comp = asChild ? Slot : 'button'; return <Comp className={cn(variants({ variant }), className)} {...props}/>; }
export function Modal({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode }) { const restoreFocus = useRef<HTMLElement | null>(document.activeElement as HTMLElement); return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45"/><Dialog.Content className="dialog-panel" onCloseAutoFocus={e => { e.preventDefault(); if(restoreFocus.current?.isConnected) restoreFocus.current.focus(); else document.getElementById("main")?.focus(); }}><Dialog.Title className="text-xl font-bold pr-10">{title}</Dialog.Title><Dialog.Description className="text-sm text-slate-500 mt-2 mb-6">{description}</Dialog.Description><Dialog.Close asChild><Button variant="ghost" className="absolute right-4 top-4 px-2" aria-label="Close dialog"><X size={18}/></Button></Dialog.Close>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>; }

