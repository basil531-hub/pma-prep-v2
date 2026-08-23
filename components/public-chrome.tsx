"use client";
import { usePathname } from "next/navigation";
import { CookieConsent } from "@/components/cookie-consent";
import { WhatsAppContact } from "@/components/whatsapp-contact";
export function PublicChrome({navbar,footer,children}:{navbar:React.ReactNode;footer:React.ReactNode;children:React.ReactNode}){const pathname=usePathname();const isAdmin=pathname.startsWith("/admin");if(isAdmin)return <>{children}</>;return <>{navbar}{children}{footer}<CookieConsent/><WhatsAppContact/></>}
