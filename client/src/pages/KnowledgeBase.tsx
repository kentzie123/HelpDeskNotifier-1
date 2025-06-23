import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NewKnowledgeArticleForm from "@/components/forms/NewKnowledgeArticleForm";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Plus,
  BookOpen,
  Eye,
  Edit,
  Star,
  Clock,
  Tag,
  Users,
  Trash2
} from "lucide-react";
import type { KnowledgeArticleWithAuthor } from "@shared/schema";

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Articles");
  const [showNewArticleForm, setShowNewArticleForm] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [] } = useQuery<KnowledgeArticleWithAuthor[]>({
    queryKey: ["/api/knowledge-articles", showDrafts],
    queryFn: () => {
      const params = showDrafts ? "?includeDrafts=true" : "";
      return fetch(`/api/knowledge-articles${params}`).then(res => res.json());
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/knowledge-articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-articles"] });
      toast({
        title: "Article deleted",
        description: "Knowledge base article deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishArticleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/knowledge-articles/${id}`, { isPublished: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-articles"] });
      toast({
        title: "Article published",
        description: "Article is now visible to all users.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteArticle = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const handlePublishArticle = (id: number) => {
    publishArticleMutation.mutate(id);
  };

  const categories = [
    { name: "All Articles", count: articles.length },
    ...Array.from(new Set(articles.map(a => a.category)))
      .map(category => ({
        name: category,
        count: articles.filter(a => a.category === category).length
      }))
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const averageRating = articles.length > 0 
    ? (articles.reduce((sum, article) => sum + (article.rating / article.ratingCount || 0), 0) / articles.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
        <div className="flex gap-2">
          <Button 
            variant={showDrafts ? "default" : "outline"}
            onClick={() => setShowDrafts(!showDrafts)}
          >
            {showDrafts ? "Show Published" : "Show Drafts"}
          </Button>
          <Button onClick={() => setShowNewArticleForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>
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
                <p className="text-2xl font-bold text-foreground">{articles.length}</p>
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
                          {!article.isPublished && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Draft
                            </Badge>
                          )}
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
                            {article.ratingCount > 0 ? (article.rating / article.ratingCount).toFixed(1) : "0.0"}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Updated {new Date(article.updatedAt).toLocaleDateString()}
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
                        {!article.isPublished && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePublishArticle(article.id)}
                            disabled={publishArticleMutation.isPending}
                            className="text-green-600 hover:text-green-800"
                          >
                            Publish
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                          disabled={deleteArticleMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <NewKnowledgeArticleForm 
        open={showNewArticleForm}
        onOpenChange={setShowNewArticleForm}
      />
    </div>
  );
}
