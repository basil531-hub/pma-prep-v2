"use client";

const defaultNumber = "923001234567";

export function WhatsAppContact() {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultNumber).replace(/\D/g, "");
  const message = encodeURIComponent("Hello PMA Prep, I need help with my preparation.");
  return <a href={`https://wa.me/${number}?text=${message}`} target="_blank" rel="noopener noreferrer" aria-label="Contact PMA Prep on WhatsApp" title="Chat with PMA Prep on WhatsApp" className="group fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] p-0 text-white shadow-[0_10px_30px_rgba(37,211,102,.28)] transition duration-200 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_14px_34px_rgba(37,211,102,.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3.5">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 stroke-current transition-transform duration-200 group-hover:scale-105 sm:h-5 sm:w-5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11.3a8.1 8.1 0 0 1-8.2 8.1 8.2 8.2 0 0 1-3.8-.9L4 19.7l1.2-3.8a8 8 0 1 1 14.8-4.6Z" />
      <path d="M8.2 8.4c.2-.4.5-.4.8-.4h.6c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .6-.4.8-.4.2-1 .4-1.5.3-2.4-.4-5.9-3.9-6.3-6.3-.1-.5.1-1.1.3-1.5Z" />
    </svg>
    <span className="hidden text-sm font-black tracking-tight sm:inline">Contact us</span>
  </a>;
}
