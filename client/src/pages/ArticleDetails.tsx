import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Tag, 
  Star,
  BookOpen,
  Clock,
  ThumbsUp
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { KnowledgeArticleWithAuthor } from "@shared/schema";
import StarRating from "@/components/ui/star-rating";

export default function ArticleDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [userRating, setUserRating] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all articles and find the specific one
  const { data: articles, isLoading } = useQuery<KnowledgeArticleWithAuthor[]>({
    queryKey: ["/api/knowledge-articles"],
  });

  const article = articles?.find(a => a.id === parseInt(id || "0"));

  // Increment views when article is viewed
  useEffect(() => {
    if (article && id) {
      apiRequest("POST", `/api/knowledge-articles/${id}/views`);
    }
  }, [article, id]);

  const rateArticleMutation = useMutation({
    mutationFn: (rating: number) => 
      apiRequest("POST", `/api/knowledge-articles/${id}/rate`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-articles"] });
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this article!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRating = (rating: number) => {
    setUserRating(rating);
    rateArticleMutation.mutate(rating);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Article not found</h3>
        <p className="text-gray-500 mb-4">The knowledge base article you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/knowledge-base")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "General": "bg-blue-100 text-blue-800",
      "Technical": "bg-green-100 text-green-800",
      "Billing": "bg-purple-100 text-purple-800",
      "Account": "bg-orange-100 text-orange-800",
      "Support": "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/knowledge-base")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Knowledge Base
        </Button>
      </div>

      {/* Article Header */}
      <Card className="border-l-4 border-l-blue-500 bg-white">
        <CardHeader className="pb-6">
          <div className="space-y-4">
            {/* Category Badge and Views */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                  {article.category}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-lg text-gray-900">{article.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({article.ratingCount} ratings)</span>
              </div>
            </div>
            
            {/* Article Title */}
            <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
              {article.title}
            </CardTitle>

            {/* Author and Date Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>By {article.author || "Unknown Author"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Published {formatDate(article.createdAt)}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDate(article.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {article.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ThumbsUp className="h-5 w-5" />
            <span>Was this article helpful?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Rate this article:</span>
              <StarRating
                rating={userRating || article.userRating || 0}
                onRatingChange={handleRating}
                readonly={rateArticleMutation.isPending}
              />
              {rateArticleMutation.isPending && (
                <span className="text-sm text-muted-foreground">Submitting...</span>
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>
                  Average: {article.rating.toFixed(1)}/5 
                  ({article.ratingCount} {article.ratingCount === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {(article.author || "A").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{article.author || "Unknown Author"}</h4>
              <p className="text-sm text-muted-foreground">
                Knowledge Base Contributor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}