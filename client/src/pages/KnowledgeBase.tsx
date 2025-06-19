import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  BookOpen,
  Eye,
  Edit,
  Star,
  Clock,
  Tag,
  Users
} from "lucide-react";

const knowledgeBaseArticles = [
  {
    id: 1,
    title: "How to Reset Your Password",
    category: "Account Management",
    author: "Sarah Jones",
    views: 1234,
    rating: 4.8,
    lastUpdated: "2025-01-18",
    tags: ["password", "security", "account"],
    excerpt: "Step-by-step guide to reset your password safely and securely."
  },
  {
    id: 2,
    title: "Troubleshooting Login Issues",
    category: "Technical Support",
    author: "Mike Brown",
    views: 892,
    rating: 4.6,
    lastUpdated: "2025-01-17",
    tags: ["login", "troubleshooting", "authentication"],
    excerpt: "Common solutions for login problems and authentication errors."
  },
  {
    id: 3,
    title: "Setting Up Two-Factor Authentication",
    category: "Security",
    author: "Emily Davis",
    views: 567,
    rating: 4.9,
    lastUpdated: "2025-01-16",
    tags: ["2fa", "security", "setup"],
    excerpt: "Complete guide to enable and configure two-factor authentication."
  },
  {
    id: 4,
    title: "Managing Your Profile Settings",
    category: "Account Management",
    author: "John Doe",
    views: 445,
    rating: 4.5,
    lastUpdated: "2025-01-15",
    tags: ["profile", "settings", "customization"],
    excerpt: "How to update and customize your profile information and preferences."
  },
  {
    id: 5,
    title: "Understanding Notification Settings",
    category: "User Guide",
    author: "Sarah Jones",
    views: 678,
    rating: 4.7,
    lastUpdated: "2025-01-14",
    tags: ["notifications", "preferences", "email"],
    excerpt: "Configure your notification preferences for optimal experience."
  },
  {
    id: 6,
    title: "API Integration Guide",
    category: "Developer",
    author: "Alex Wilson",
    views: 321,
    rating: 4.8,
    lastUpdated: "2025-01-13",
    tags: ["api", "integration", "developer"],
    excerpt: "Developer guide for integrating with our platform APIs."
  }
];

const categories = [
  { name: "All Articles", count: 6 },
  { name: "Account Management", count: 2 },
  { name: "Technical Support", count: 1 },
  { name: "Security", count: 1 },
  { name: "User Guide", count: 1 },
  { name: "Developer", count: 1 }
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Articles");

  const filteredArticles = knowledgeBaseArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All Articles" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const colors = {
      "Account Management": "bg-blue-100 text-blue-800",
      "Technical Support": "bg-red-100 text-red-800",
      "Security": "bg-purple-100 text-purple-800",
      "User Guide": "bg-green-100 text-green-800",
      "Developer": "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const totalViews = knowledgeBaseArticles.reduce((sum, article) => sum + article.views, 0);
  const averageRating = (knowledgeBaseArticles.reduce((sum, article) => sum + article.rating, 0) / knowledgeBaseArticles.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold text-foreground">{knowledgeBaseArticles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">{averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedCategory === category.name
                      ? "text-primary bg-blue-100"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search articles, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No articles found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                            {article.title}
                          </h3>
                          <Badge className={getCategoryBadge(article.category)}>
                            {article.category}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>By {article.author}</span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {article.views} views
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {article.rating}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Updated {new Date(article.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
