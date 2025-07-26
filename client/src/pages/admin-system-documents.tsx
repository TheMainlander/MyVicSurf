import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AdminNavigationHeader from '@/components/admin/admin-navigation-header';
import { FileText, Download, Eye, Edit, Trash, Plus, Filter, Search, Database, FileCode, Clipboard, BookOpen } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description: string;
  content: string;
  category: 'marketing' | 'system_admin';
  type: 'strategy' | 'campaign' | 'analysis' | 'report' | 'proposal' | 'prd' | 'solution_design' | 'technical_spec';
  format: 'md' | 'pdf';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export default function AdminSystemDocuments() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFormat, setExportFormat] = useState<'md' | 'pdf' | 'html' | 'txt'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system admin documents
  const { data: documents = [], isLoading, refetch, error } = useQuery({
    queryKey: ['/api/admin/documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/documents?category=system_admin');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin authentication required');
        }
        throw new Error('Failed to fetch documents');
      }
      return await response.json() as Document[];
    },
    retry: false
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: Partial<Document>) => {
      const response = await apiRequest('POST', '/api/admin/documents', {
        ...documentData,
        category: 'system_admin'
      });
      if (!response.ok) throw new Error('Failed to create document');
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "System document created successfully." });
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create document.", variant: "destructive" });
    }
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Document> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/admin/documents/${id}`, data);
      if (!response.ok) throw new Error('Failed to update document');
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document updated successfully." });
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update document.", variant: "destructive" });
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/documents/${id}`);
      if (!response.ok) throw new Error('Failed to delete document');
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Document deleted successfully." });
      refetch();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  });

  const handleDownloadDocument = async (doc: Document, format?: string) => {
    setIsExporting(true);
    try {
      const downloadFormat = format || doc.format;
      const response = await apiRequest('GET', `/api/admin/documents/${doc.id}/download?format=${downloadFormat}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${doc.title} exported as ${downloadFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "Could not export the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async (doc: Document, format: 'md' | 'pdf' | 'html' | 'txt') => {
    await handleDownloadDocument(doc, format);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prd': return <Database className="w-4 h-4" />;
      case 'solution_design': return <BookOpen className="w-4 h-4" />;
      case 'technical_spec': return <FileCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prd': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'solution_design': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'technical_spec': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminNavigationHeader 
          currentPath="/admin/system-documents"
          title="System Admin Documents"
          description="Manage technical documentation and system specifications"
        />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">Access denied. Admin authentication required.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigationHeader 
        currentPath="/admin/system-documents"
        title="System Admin Documents"
        description="Manage technical documentation, PRDs, and system specifications"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="prd">PRD</SelectItem>
              <SelectItem value="solution_design">Solution Design</SelectItem>
              <SelectItem value="technical_spec">Technical Spec</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(doc.type)}
                      <Badge className={getTypeColor(doc.type)}>
                        {doc.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc, 'pdf')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight text-black dark:text-white">
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>By {doc.createdBy}</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsEditDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocumentMutation.mutate(doc.id)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first system document to get started.'
                }
              </p>
              {(!searchTerm && filterType === 'all') && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Preview Dialog */}
        <Dialog open={!!selectedDocument && !isEditDialogOpen} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
                {selectedDocument && getTypeIcon(selectedDocument.type)}
                {selectedDocument?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-black dark:text-white overflow-x-auto">
                  {selectedDocument?.content}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => selectedDocument && handleDownloadDocument(selectedDocument, 'pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={() => setSelectedDocument(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}