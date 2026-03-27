"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderLock, ListTodo, Calendar, Users, LayoutDashboard } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  
  // Hide navigation on login page
  if (pathname === "/login") return null;

  const navItems = [
    { name: "DASHBOARD", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "VAULT", icon: <FolderLock size={20} />, path: "/vault" },
    { name: "TASKS", icon: <ListTodo size={20} />, path: "/tasks" },
    { name: "CALENDAR", icon: <Calendar size={20} />, path: "/calendar" },
    { name: "FANS", icon: <Users size={20} />, path: "/fans" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 md:hidden flex justify-between items-center px-4 py-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              pathname === item.path ? "text-white scale-110" : "text-zinc-600"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-mono tracking-tighter uppercase">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Navigation (Left Sidebar) */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-zinc-900 hidden md:flex flex-col p-8 space-y-12 z-50">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-2 h-2 bg-white rounded-full" />
            <h1 className="text-2xl font-black uppercase tracking-tighter">OUTLANDIA.</h1>
          </div>
          <p className="text-zinc-600 font-mono text-[10px] tracking-widest uppercase italic">Artist OS // Terminal Mode</p>
        </div>

        <div className="flex flex-col space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-4 px-4 py-3 border border-transparent transition-all hover:bg-zinc-900 ${
                pathname === item.path ? "bg-zinc-900 border-zinc-800 text-white" : "text-zinc-500"
              }`}
            >
              {item.icon}
              <span className="font-mono text-xs uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="pt-8 border-t border-zinc-900">
           <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-widest">System Status: Active</p>
           <p className="text-zinc-800 font-mono text-[10px] uppercase tracking-widest">Version: 1.0.4</p>
        </div>
      </nav>
    </>
  );
}
