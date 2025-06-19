import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar
} from "lucide-react";
import type { Ticket, User } from "@shared/schema";

export default function Reports() {
  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const pendingTickets = tickets.filter(t => t.status === "in_progress").length;
  const openTickets = tickets.filter(t => t.status === "open").length;
  const highPriorityTickets = tickets.filter(t => t.priority === "high").length;
  
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const averageResponseTime = "2.3 hours"; // Mock calculation
  
  const agentCount = users.filter(u => u.role === "agent").length;
  const customerCount = users.filter(u => u.role === "customer").length;

  const recentActivity = [
    { date: "2025-01-20", tickets: 12, resolved: 8 },
    { date: "2025-01-19", tickets: 15, resolved: 10 },
    { date: "2025-01-18", tickets: 8, resolved: 7 },
    { date: "2025-01-17", tickets: 18, resolved: 15 },
    { date: "2025-01-16", tickets: 22, resolved: 18 },
    { date: "2025-01-15", tickets: 14, resolved: 12 },
    { date: "2025-01-14", tickets: 16, resolved: 14 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{totalTickets}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold text-foreground">{resolutionRate}%</p>
                <p className="text-xs text-green-600 mt-1">+3% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold text-foreground">{averageResponseTime}</p>
                <p className="text-xs text-red-600 mt-1">+0.2h from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-foreground">{highPriorityTickets}</p>
                <p className="text-xs text-red-600 mt-1">-2 from yesterday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Open</span>
                <span className="text-sm text-muted-foreground">{openTickets} tickets</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(openTickets / totalTickets) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-muted-foreground">{pendingTickets} tickets</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(pendingTickets / totalTickets) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resolved</span>
                <span className="text-sm text-muted-foreground">{resolvedTickets} tickets</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(resolvedTickets / totalTickets) * 100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Active Agents</span>
                </div>
                <span className="text-lg font-bold">{agentCount}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium">Total Customers</span>
                </div>
                <span className="text-lg font-bold">{customerCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium">Tickets Today</span>
                </div>
                <span className="text-lg font-bold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">{day.tickets} tickets created</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{day.resolved} resolved</p>
                  <p className="text-sm text-muted-foreground">{Math.round((day.resolved / day.tickets) * 100)}% rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
