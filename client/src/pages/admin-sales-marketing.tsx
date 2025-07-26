import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import { Download, FileText, Plus, Edit, Trash2, Eye, Calendar, User } from "lucide-react";

interface MarketingDocument {
  id: number;
  title: string;
  description: string;
  content: string;
  type: 'strategy' | 'campaign' | 'analysis' | 'report' | 'proposal';
  format: 'md' | 'pdf';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function AdminSalesMarketing() {
  const [selectedDocument, setSelectedDocument] = useState<MarketingDocument | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  // Fetch marketing documents
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/marketing-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/marketing-documents');
      return await response.json() as MarketingDocument[];
    }
  });

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    content: '',
    type: 'strategy' as const,
    format: 'md' as const
  });

  const handleCreateDocument = async () => {
    try {
      await apiRequest('POST', '/api/admin/marketing-documents', newDocument);
      toast({
        title: "Document Created",
        description: "Marketing document has been successfully created.",
      });
      setNewDocument({
        title: '',
        description: '',
        content: '',
        type: 'strategy',
        format: 'md'
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (doc: MarketingDocument) => {
    try {
      const response = await apiRequest('GET', `/api/admin/marketing-documents/${doc.id}/download`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${doc.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `${doc.title} is downloading...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await apiRequest('DELETE', `/api/admin/marketing-documents/${docId}`);
      toast({
        title: "Document Deleted",
        description: "Marketing document has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strategy': return 'bg-blue-100 text-blue-800';
      case 'campaign': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      case 'proposal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => 
    filterType === 'all' || doc.type === filterType
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigationHeader 
        currentPath="/admin/sales-marketing"
        title="Sales & Marketing"
        description="Manage marketing documents, strategies, and campaigns"
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-ocean-blue hover:bg-ocean-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Marketing Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black mb-1 block">Title</label>
                  <Input
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                    placeholder="Document title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-black mb-1 block">Description</label>
                  <Textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    placeholder="Brief description of the document"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-black mb-1 block">Type</label>
                    <Select 
                      value={newDocument.type} 
                      onValueChange={(value: 'strategy' | 'campaign' | 'analysis' | 'report' | 'proposal') => 
                        setNewDocument({ ...newDocument, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategy">Strategy</SelectItem>
                        <SelectItem value="campaign">Campaign</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black mb-1 block">Format</label>
                    <Select 
                      value={newDocument.format} 
                      onValueChange={(value: 'md' | 'pdf') => 
                        setNewDocument({ ...newDocument, format: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md">Markdown (.md)</SelectItem>
                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-black mb-1 block">Content</label>
                  <Textarea
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                    placeholder="Document content (Markdown supported)"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDocument} className="bg-ocean-blue hover:bg-ocean-blue/90">
                    Create Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Documents Found</h3>
              <p className="text-gray-600 mb-4">
                {filterType === 'all' 
                  ? "Create your first marketing document to get started."
                  : `No ${filterType} documents found. Try a different filter or create a new document.`
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-ocean-blue hover:bg-ocean-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-black truncate">{doc.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                    </div>
                    <Badge className={`ml-2 text-xs ${getTypeColor(doc.type)}`}>
                      {doc.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {doc.createdBy}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        .{doc.format}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        className="h-8 w-8 p-0 text-ocean-blue hover:text-ocean-blue/80"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewDocument({
                            title: doc.title,
                            description: doc.description,
                            content: doc.content,
                            type: doc.type,
                            format: doc.format
                          });
                          setSelectedDocument(doc);
                          setIsEditDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Preview Dialog */}
        <Dialog open={!!selectedDocument && !isEditDialogOpen} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-black">{selectedDocument?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <Badge className={getTypeColor(selectedDocument?.type || '')}>
                  {selectedDocument?.type}
                </Badge>
                <span>Created: {selectedDocument && new Date(selectedDocument.createdAt).toLocaleDateString()}</span>
                <span>Format: .{selectedDocument?.format}</span>
              </div>
              
              <p className="text-gray-700">{selectedDocument?.description}</p>
              
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-black font-mono">
                  {selectedDocument?.content}
                </pre>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setSelectedDocument(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}