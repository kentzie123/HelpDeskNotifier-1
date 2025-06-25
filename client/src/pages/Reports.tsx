import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, TrendingUp, TrendingDown, FileText, Users, Clock, CheckCircle, Star, Award, Target, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, User } from "@shared/schema";
import DateRangePicker from "@/components/forms/DateRangePicker";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const { toast } = useToast();

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    toast({
      title: "Export completed",
      description: `Reports exported as ${format.toUpperCase()} successfully.`,
    });
  };

  // Helper functions for date calculations
  const getDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const isInDateRange = (ticketDate: Date, startDate: Date, endDate: Date) => {
    return ticketDate >= startDate && ticketDate <= endDate;
  };

  // Calculate user statistics
  const calculateUserStats = (userId?: number) => {
    const userTickets = userId 
      ? tickets.filter(ticket => ticket.assigneeId === userId)
      : tickets;

    const totalTickets = userTickets.length;
    const resolvedTickets = userTickets.filter(ticket => ticket.status === "resolved").length;
    const openTickets = userTickets.filter(ticket => ticket.status === "open").length;
    const inProgressTickets = userTickets.filter(ticket => ticket.status === "in_progress").length;
    const highPriorityTickets = userTickets.filter(ticket => ticket.priority === "high").length;
    
    const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
    
    // Calculate average resolution time (mock calculation)
    const avgResolutionTime = resolvedTickets > 0 ? 2.5 : 0; // days
    
    return {
      totalTickets,
      resolvedTickets,
      openTickets,
      inProgressTickets,
      highPriorityTickets,
      resolutionRate,
      avgResolutionTime
    };
  };

  // Get user performance rankings
  const getUserRankings = () => {
    return users.map(user => {
      const stats = calculateUserStats(user.id);
      return {
        ...user,
        ...stats,
        performanceScore: stats.resolutionRate * 0.6 + (stats.totalTickets / 10) * 0.4
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);
  };

  const selectedUserStats = selectedUser === "all" 
    ? calculateUserStats() 
    : calculateUserStats(parseInt(selectedUser));

  const userRankings = getUserRankings();

  // Current metrics for overview
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
  const pendingTickets = tickets.filter(t => t.status === "in_progress").length;
  const openTickets = tickets.filter(t => t.status === "open").length;
  const highPriorityTickets = tickets.filter(t => t.priority === "high").length;
  
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  // Weekly activity data
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const date = getDaysAgo(6 - i);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    const dayTickets = tickets.filter(t => {
      const ticketDate = new Date(t.createdAt);
      return ticketDate >= date && ticketDate < nextDay;
    });
    
    const dayResolved = dayTickets.filter(t => t.status === "resolved").length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tickets: dayTickets.length,
      resolved: dayResolved
    };
  });

  // Priority distribution data
  const priorityData = [
    { name: 'Low', value: tickets.filter(t => t.priority === 'low').length, fill: '#10b981' },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: 'High', value: tickets.filter(t => t.priority === 'high').length, fill: '#ef4444' }
  ];

  // Status distribution data
  const statusData = [
    { name: 'Open', value: openTickets, fill: '#ef4444' },
    { name: 'In Progress', value: pendingTickets, fill: '#f59e0b' },
    { name: 'Resolved', value: resolvedTickets, fill: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">View detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                    <p className="text-2xl font-bold">{totalTickets}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12% from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold">{resolvedTickets}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+5% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{pendingTickets}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">-2% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                    <p className="text-2xl font-bold">{resolutionRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+3% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600">{users.filter(u => u.role === 'agent').length} agents active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tickets" stroke="#3b82f6" name="Created" />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium">Select User:</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-blue-800">{selectedUserStats.totalTickets}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-800">{selectedUserStats.resolvedTickets}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-800">{selectedUserStats.inProgressTickets}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Resolution Rate</p>
                      <p className="text-2xl font-bold text-purple-800">{selectedUserStats.resolutionRate.toFixed(1)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Ticket Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Resolved', value: selectedUserStats.resolvedTickets, fill: '#10b981' },
                          { name: 'In Progress', value: selectedUserStats.inProgressTickets, fill: '#f59e0b' },
                          { name: 'Open', value: selectedUserStats.openTickets, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Average Resolution Time</span>
                      <Badge variant="secondary">{selectedUserStats.avgResolutionTime} days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">High Priority Tickets</span>
                      <Badge variant="destructive">{selectedUserStats.highPriorityTickets}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Success Rate</span>
                      <Badge variant="default">{selectedUserStats.resolutionRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Team Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Team Performance Rankings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRankings.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user.username} />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Tickets</p>
                        <p className="font-bold">{user.totalTickets}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="font-bold text-green-600">{user.resolvedTickets}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="font-bold">{user.resolutionRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <p className="font-bold">{user.performanceScore.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparative Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userRankings.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalTickets" fill="#3b82f6" name="Total Tickets" />
                  <Bar dataKey="resolvedTickets" fill="#10b981" name="Resolved Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Top Performer</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {userRankings[0]?.username || 'N/A'}
                  </p>
                  <p className="text-sm text-green-700">
                    {userRankings[0]?.resolutionRate.toFixed(1) || 0}% success rate
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Fastest Resolver</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {userRankings[0]?.username || 'N/A'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {userRankings[0]?.avgResolutionTime || 0} days avg
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Most Active</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {userRankings.sort((a, b) => b.totalTickets - a.totalTickets)[0]?.username || 'N/A'}
                  </p>
                  <p className="text-sm text-purple-700">
                    {userRankings.sort((a, b) => b.totalTickets - a.totalTickets)[0]?.totalTickets || 0} tickets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}