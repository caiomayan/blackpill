import Link from "next/link";
import Image from "next/image";
import { IconBrandGithub } from "@tabler/icons-react";

export default function About() {
  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-12 md:py-24 text-center flex flex-col items-center justify-center min-h-[calc(100vh-140px)] pb-24">
      <div className="flex w-full flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo */}
        <div className="relative h-48 w-48 hover:scale-105 transition-transform duration-500">
          <Image src="/blackpill.png" alt="Logo" fill className="object-contain drop-shadow-xl opacity-90" sizes="(max-width: 768px) 192px, 192px" priority />
        </div>

        {/* Text Container */}
        <div className="space-y-4 text-[15px] md:text-lg leading-relaxed text-neutral-500 tracking-wide font-medium bg-white/60 backdrop-blur-2xl border border-white px-8 md:px-12 py-10 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.06)] transition-shadow duration-500">
          <p>
            <strong className="font-black text-black text-lg md:text-xl tracking-tight">Black Pill</strong> is an MVP system,
            built with <span className="text-black font-bold">Next.js</span>, aimed at
            creating a dedicated social platform for
            <br className="hidden md:block" /> <span className="text-black font-bold">Counter-Strike 2</span> players and teams.
          </p>
          <p className="text-sm md:text-base text-neutral-400 font-medium pt-2">
            In the future, automated tournaments and live server integration will be implemented.
          </p>
        </div>

        {/* GitHub Button */}
        <Link
          href="https://github.com/caio/blackpill"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold text-sm tracking-wide hover:bg-neutral-800 hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgb(0,0,0,0.2)]"
        >
          <IconBrandGithub size={22} className="group-hover:rotate-12 transition-transform duration-300" />
          <span>View on GitHub</span>
        </Link>
        
      </div>
    </main>
  );
}
