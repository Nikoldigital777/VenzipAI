import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import Navigation from "@/components/navigation"; // Removed Navigation import
import LazyAIChat from "@/components/LazyAIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Play, 
  BookOpen, 
  FileText, 
  Video, 
  Award,
  Clock,
  Filter,
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  PlayCircle,
  Download,
  ExternalLink,
  Sparkles,
  Target,
  Brain,
  Shield,
  Globe,
  Heart,
  Zap,
  BookMarked,
  GraduationCap,
  ChevronRight,
  BarChart3
} from "lucide-react";

interface LearningResource {
  id: string;
  title: string;
  description: string;
  resourceType: 'pdf' | 'video' | 'article' | 'course';
  frameworkId?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  resourceUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

interface LearningProgress {
  id: string;
  resourceId: string;
  progressPercentage: number;
  completedAt?: string;
  lastAccessedAt: string;
  totalTimeSpent: number;
  bookmarkPosition?: number;
}

const resourceTypeConfig = {
  pdf: { icon: FileText, label: 'PDF Guide', color: 'text-danger-coral', bg: 'from-danger-coral/10' },
  video: { icon: Video, label: 'Video Tutorial', color: 'text-info-blue', bg: 'from-info-blue/10' },
  article: { icon: BookOpen, label: 'Article', color: 'text-success-green', bg: 'from-success-green/10' },
  course: { icon: GraduationCap, label: 'Full Course', color: 'text-venzip-primary', bg: 'from-venzip-primary/10' }
};

const difficultyConfig = {
  beginner: { color: 'text-success-green', bg: 'bg-success-green/10', icon: Star },
  intermediate: { color: 'text-warning-orange', bg: 'bg-warning-orange/10', icon: TrendingUp },
  advanced: { color: 'text-danger-coral', bg: 'bg-danger-coral/10', icon: Target }
};

const frameworkConfig = {
  soc2: { name: 'SOC 2', color: 'text-venzip-primary', bg: 'bg-venzip-primary/10', icon: Shield },
  iso27001: { name: 'ISO 27001', color: 'text-venzip-secondary', bg: 'bg-venzip-secondary/10', icon: Globe },
  hipaa: { name: 'HIPAA', color: 'text-danger-coral', bg: 'bg-danger-coral/10', icon: Heart },
  gdpr: { name: 'GDPR', color: 'text-info-blue', bg: 'bg-info-blue/10', icon: Users }
};

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Fetch learning resources
  const { data: resourcesResponse, isLoading } = useQuery<{items: LearningResource[]}>({
    queryKey: ["/api/learning-resources", selectedFramework, selectedResourceType, selectedDifficulty, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFramework) params.append('frameworkId', selectedFramework);
      if (selectedResourceType) params.append('resourceType', selectedResourceType);
      if (searchQuery.trim()) params.append('search', searchQuery);

      const response = await apiRequest("GET", `/api/learning-resources?${params.toString()}`);
      return response.json();
    },
  });

  const resources = resourcesResponse?.items || [];

  // Fetch user progress
  const { data: progressData = [] } = useQuery({
    queryKey: ["/api/learning-progress"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/learning-progress");
      return response.json();
    },
  });

  // Fetch completed resources
  const { data: completedResources = [] } = useQuery({
    queryKey: ["/api/learning-completed"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/learning-completed");
      return response.json();
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { resourceId: string; progressPercentage: number; bookmarkPosition?: number }) => {
      const response = await apiRequest("POST", "/api/learning-progress", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-completed"] });
    },
  });

  // Get progress for a resource
  const getResourceProgress = (resourceId: string): number => {
    const progress = progressData.find((p: LearningProgress) => p.resourceId === resourceId);
    return progress?.progressPercentage || 0;
  };

  // Check if resource is completed
  const isResourceCompleted = (resourceId: string): boolean => {
    return completedResources.some((p: LearningProgress) => p.resourceId === resourceId);
  };

  // Handle resource access
  const handleResourceAccess = (resource: LearningResource) => {
    // Update last accessed and increment time
    updateProgressMutation.mutate({
      resourceId: resource.id,
      progressPercentage: getResourceProgress(resource.id) || 0,
    });

    // Open the resource
    window.open(resource.resourceUrl, '_blank');
  };

  // Calculate overall progress stats
  const totalResources = resources.length;
  const completedCount = completedResources.length;
  const inProgressCount = progressData.filter((p: LearningProgress) => p.progressPercentage > 0 && p.progressPercentage < 100).length;
  const overallProgress = totalResources > 0 ? (completedCount / totalResources) * 100 : 0;

  // Filter resources based on search and filters
  const filteredResources = resources.filter((resource: LearningResource) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!resource.title.toLowerCase().includes(query) && 
          !resource.description?.toLowerCase().includes(query) &&
          !resource.tags.some(tag => tag.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (selectedDifficulty && resource.difficulty !== selectedDifficulty) return false;
    return true;
  });

  // Sample data initialization (in a real app, this would be seeded)
  useEffect(() => {
    // This would typically be seeded data or fetched from an admin interface
    // For demo purposes, we'll show placeholder resources
  }, []);

  return (
    <>
      {/* Navigation component removed as per changes */}
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50/80 via-white/50 to-venzip-primary/5 relative overflow-hidden" data-testid="nav-learning-hub">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Header Section */}
          <div className="mb-12 animate-fadeInUp">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                  <span className="text-gradient-primary">Self-Learning</span> Hub
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-6">
                  Master compliance with expert-curated resources and track your progress
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalResources} Resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-green" />
                    <span>{completedCount} Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning-orange" />
                    <span>{inProgressCount} In Progress</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">Overall Progress</div>
                <div className="w-32 mb-2">
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <div className="text-2xl font-bold text-venzip-primary">{Math.round(overallProgress)}%</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="glass-card mb-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search resources, topics, or frameworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base border-0 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm"
                    data-testid="input-search-resources"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Framework Filter */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedFramework === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFramework(null)}
                      className="rounded-xl"
                    >
                      All Frameworks
                    </Button>
                    {Object.entries(frameworkConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <Button
                          key={key}
                          variant={selectedFramework === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFramework(selectedFramework === key ? null : key)}
                          className="rounded-xl flex items-center gap-2"
                        >
                          <IconComponent className="h-4 w-4" />
                          {config.name}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Resource Type Filter */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(resourceTypeConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <Button
                          key={key}
                          variant={selectedResourceType === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedResourceType(selectedResourceType === key ? null : key)}
                          className="rounded-xl flex items-center gap-2"
                        >
                          <IconComponent className="h-4 w-4" />
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Difficulty Filter */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(difficultyConfig).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <Button
                          key={key}
                          variant={selectedDifficulty === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDifficulty(selectedDifficulty === key ? null : key)}
                          className="rounded-xl flex items-center gap-2"
                        >
                          <IconComponent className="h-4 w-4" />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">Total Resources</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-venzip-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{totalResources}</div>
                <div className="text-sm text-gray-500">Available for learning</div>
              </CardContent>
            </Card>

            <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">Completed</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-2xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{completedCount}</div>
                <div className="text-sm text-gray-500">Successfully finished</div>
              </CardContent>
            </Card>

            <Card className="glass-card group hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-600">In Progress</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-warning-orange" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{inProgressCount}</div>
                <div className="text-sm text-gray-500">Currently learning</div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Resources Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <Card className="glass-card animate-fadeInUp">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Resources Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery.trim() 
                    ? "Try adjusting your search query or filters to find more resources." 
                    : "Learning resources will appear here once they are added to the system."
                  }
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedFramework(null); setSelectedResourceType(null); setSelectedDifficulty(null); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource: LearningResource, index: number) => {
                const resourceTypeInfo = resourceTypeConfig[resource.resourceType];
                const difficultyInfo = difficultyConfig[resource.difficulty];
                const frameworkInfo = resource.frameworkId ? frameworkConfig[resource.frameworkId as keyof typeof frameworkConfig] : null;
                const progress = getResourceProgress(resource.id);
                const isCompleted = isResourceCompleted(resource.id);
                const ResourceIcon = resourceTypeInfo.icon;
                const DifficultyIcon = difficultyInfo.icon;

                return (
                  <Card 
                    key={resource.id} 
                    className="glass-card group hover-lift cursor-pointer relative overflow-hidden animate-fadeInUp"
                    style={{animationDelay: `${0.1 * index}s`}}
                    onClick={() => handleResourceAccess(resource)}
                    data-testid={`resource-card-${resource.id}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${resourceTypeInfo.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {/* Thumbnail/Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-t-3xl overflow-hidden">
                      {resource.thumbnailUrl ? (
                        <img 
                          src={resource.thumbnailUrl} 
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-venzip-primary/10 to-venzip-accent/10">
                          <ResourceIcon className={`h-16 w-16 ${resourceTypeInfo.color}`} />
                        </div>
                      )}

                      {/* Progress indicator */}
                      {progress > 0 && (
                        <div className="absolute top-4 right-4">
                          {isCompleted ? (
                            <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <div className="text-xs font-bold text-gray-700">{progress}%</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resource type badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${resourceTypeInfo.bg} ${resourceTypeInfo.color} border-0 font-medium flex items-center gap-1`}>
                          <ResourceIcon className="h-3 w-3" />
                          {resourceTypeInfo.label}
                        </Badge>
                      </div>

                      {/* Play button overlay for videos */}
                      {resource.resourceType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <PlayCircle className="h-8 w-8 text-venzip-primary" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 relative z-10">
                      {/* Title and Description */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-venzip-primary transition-colors duration-300 line-clamp-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
                      </div>

                      {/* Meta information */}
                      <div className="flex items-center gap-3 mb-4 text-xs">
                        {/* Duration */}
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{resource.duration}min</span>
                        </div>

                        {/* Difficulty */}
                        <Badge className={`${difficultyInfo.bg} ${difficultyInfo.color} border-0 text-xs font-medium flex items-center gap-1`}>
                          <DifficultyIcon className="h-3 w-3" />
                          {resource.difficulty}
                        </Badge>

                        {/* Framework */}
                        {frameworkInfo && (
                          <Badge className={`${frameworkInfo.bg} ${frameworkInfo.color} border-0 text-xs font-medium flex items-center gap-1`}>
                            <frameworkInfo.icon className="h-3 w-3" />
                            {frameworkInfo.name}
                          </Badge>
                        )}
                      </div>

                      {/* Progress bar */}
                      {progress > 0 && (
                        <div className="mb-4">
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs px-2 py-1 rounded-lg">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-1 rounded-lg">
                              +{resource.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-venzip-primary to-venzip-accent text-white hover:shadow-lg hover:shadow-venzip-primary/25 transition-all duration-300 rounded-2xl group-hover:scale-105"
                        data-testid={`button-access-${resource.id}`}
                      >
                        <div className="flex items-center gap-2">
                          {resource.resourceType === 'video' ? (
                            <>
                              <Play className="h-4 w-4" />
                              <span>Watch Now</span>
                            </>
                          ) : resource.resourceType === 'pdf' ? (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download PDF</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4" />
                              <span>Open Resource</span>
                            </>
                          )}
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Stats Section */}
          {completedCount > 0 && (
            <Card className="glass-card mt-8 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-success-green" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Learning Achievements</div>
                    <div className="text-sm text-gray-500 font-normal">Your compliance learning journey</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-success-green/20 to-success-green/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-success-green" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{completedCount}</div>
                    <div className="text-sm text-gray-600">Resources Completed</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-venzip-primary/20 to-venzip-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-venzip-primary" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {progressData.reduce((acc: number, p: LearningProgress) => acc + p.totalTimeSpent, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Minutes Learned</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-venzip-accent/20 to-venzip-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-8 w-8 text-venzip-accent" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{Math.round(overallProgress)}%</div>
                    <div className="text-sm text-gray-600">Overall Progress</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-warning-orange/20 to-warning-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-8 w-8 text-warning-orange" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{inProgressCount}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <LazyAIChat />
    </>
  );
}