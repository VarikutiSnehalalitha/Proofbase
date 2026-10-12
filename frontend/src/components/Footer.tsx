import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">Proofbase</span>
            <span className="text-xs text-slate-400">
              — Verified Project Portfolio & Proof of Work Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/discover" className="hover:text-slate-900 transition-colors">
              Explore Showcase
            </Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">
              Candidate Login
            </Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors">
              Create Portfolio
            </Link>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for engineering leaders & builders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
