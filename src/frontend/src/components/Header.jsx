import React from "react";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "./ui/Input";

const Header = () => {
  const { user, userRoles } = useAuth();

  return (
    <header className="h-20 border-b border-border-light bg-white/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <Input 
          placeholder="Buscar muestras, equipos, reportes..." 
          className="pl-10 bg-bg-surface border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2.5 rounded-xl hover:bg-bg-surface text-text-muted transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-10 w-px bg-border-light"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-main leading-none">{user?.username}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">{userRoles[0]}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
