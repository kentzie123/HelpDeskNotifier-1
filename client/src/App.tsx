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
      <Route path="/tickets/:id">
        <Layout>
          <TicketDetails />
        </Layout>
      </Route>
      <Route path="/knowledge-base/:id">
        <Layout>
          <ArticleDetails />
        </Layout>
      </Route>
      <Route path="/tickets">
        <Layout>
          <Tickets />
        </Layout>
      </Route>
      <Route path="/notifications">
        <Layout>
          <Notifications />
        </Layout>
      </Route>
      <Route path="/users">
        <Layout>
          <Users />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <Reports />
        </Layout>
      </Route>
      <Route path="/knowledge-base">
        <Layout>
          <KnowledgeBase />
        </Layout>
      </Route>
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route component={NotFound} />
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
