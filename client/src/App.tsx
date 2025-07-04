import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Tickets from "@/pages/Tickets";
import TicketDetails from "@/pages/TicketDetails";
import Notifications from "@/pages/Notifications";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ArticleDetails from "@/pages/ArticleDetails";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Authentication routes without layout */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Main app routes with layout */}
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tickets" component={Tickets} />
            <Route path="/tickets/:id" component={TicketDetails} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/users" component={Users} />
            <Route path="/reports" component={Reports} />
            <Route path="/knowledge-base" component={KnowledgeBase} />
            <Route path="/knowledge-base/:id" component={ArticleDetails} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
