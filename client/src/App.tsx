import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/lib/userContext";
import ChatPage from "@/pages/ChatPage";
import BedsPage from "@/pages/BedsPage";
import NotFound from "@/pages/not-found";
import { MessageSquare, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Chat", icon: MessageSquare },
    { path: "/beds", label: "Beds", icon: Grid3x3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={ChatPage} />
        <Route path="/beds" component={BedsPage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <div className="pb-16 lg:pb-0">
            <Router />
          </div>
        </UserProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
