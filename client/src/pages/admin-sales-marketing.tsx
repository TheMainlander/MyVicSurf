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
import { Download, FileText, Plus, Edit, Trash2, Eye, Calendar, User, Share2, Copy, Mail, ExternalLink, FileType, Image } from "lucide-react";

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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareDocument, setShareDocument] = useState<MarketingDocument | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<'md' | 'pdf' | 'html' | 'txt'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch marketing documents
  const { data: documents = [], isLoading, refetch, error } = useQuery({
    queryKey: ['/api/admin/marketing-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/marketing-documents');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin authentication required');
        }
        throw new Error('Failed to fetch documents');
      }
      return await response.json() as MarketingDocument[];
    },
    retry: false // Don't retry auth errors
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

  const handleDownloadDocument = async (doc: MarketingDocument, format?: string) => {
    setIsExporting(true);
    try {
      const downloadFormat = format || doc.format;
      const response = await apiRequest('GET', `/api/admin/marketing-documents/${doc.id}/download?format=${downloadFormat}`);
      
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

  const handleQuickExport = async (doc: MarketingDocument, format: 'md' | 'pdf' | 'html' | 'txt') => {
    await handleDownloadDocument(doc, format);
  };

  const handleCopyToClipboard = async (doc: MarketingDocument) => {
    try {
      await navigator.clipboard.writeText(doc.content);
      toast({
        title: "Copied to Clipboard",
        description: "Document content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareByEmail = (doc: MarketingDocument) => {
    const subject = `VicSurf Marketing Document: ${doc.title}`;
    const body = `Hi,\n\nI'm sharing the following marketing document with you:\n\n**${doc.title}**\n${doc.description}\n\nType: ${doc.type}\nCreated: ${new Date(doc.createdAt).toLocaleDateString()}\n\nBest regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const handleShareDialog = (doc: MarketingDocument) => {
    setShareDocument(doc);
    setIsShareDialogOpen(true);
  };

  const handleBulkExport = async () => {
    setIsExporting(true);
    try {
      for (const doc of filteredDocuments) {
        await handleDownloadDocument(doc, 'pdf');
        // Add small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "Bulk Export Complete",
        description: `Successfully exported ${filteredDocuments.length} documents as PDF`,
      });
    } catch (error) {
      toast({
        title: "Bulk Export Failed",
        description: "Some documents may not have been exported. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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

          <div className="flex space-x-2">
            {filteredDocuments.length > 0 && (
              <Button
                variant="outline"
                onClick={() => handleBulkExport()}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export All ({filteredDocuments.length})</span>
              </Button>
            )}
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-ocean-blue hover:bg-ocean-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Create Document Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
        ) : error ? (
          <Card className="text-center py-12 border-red-200 bg-red-50">
            <CardContent>
              <div className="text-red-600 mb-4">
                <FileText className="h-16 w-16 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Access Denied</h3>
              <p className="text-red-700 mb-4">
                Admin authentication required to view marketing documents. 
                Please ensure you're logged in as an administrator.
              </p>
              <p className="text-sm text-red-600">
                Error: {error?.message}
              </p>
            </CardContent>
          </Card>
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
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareDialog(doc)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        title="Share & Export"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(doc)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        title="Copy to Clipboard"
                      >
                        <Copy className="h-4 w-4" />
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
                        title="Edit Document"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Delete Document"
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

        {/* Share & Export Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-black flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-green-600" />
                Share & Export: {shareDocument?.title}
              </DialogTitle>
              <p className="text-gray-600">Choose how you'd like to share or export this document</p>
            </DialogHeader>
            
            {shareDocument && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="text-center space-y-2">
                      <Copy className="h-8 w-8 mx-auto text-blue-600" />
                      <h3 className="font-medium text-black">Copy Content</h3>
                      <p className="text-sm text-gray-600">Copy document text to clipboard</p>
                      <Button 
                        onClick={() => handleCopyToClipboard(shareDocument)}
                        className="w-full"
                        variant="outline"
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="text-center space-y-2">
                      <Mail className="h-8 w-8 mx-auto text-green-600" />
                      <h3 className="font-medium text-black">Email Share</h3>
                      <p className="text-sm text-gray-600">Share via email client</p>
                      <Button 
                        onClick={() => handleShareByEmail(shareDocument)}
                        className="w-full"
                        variant="outline"
                      >
                        Open Email
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Export Formats */}
                <div>
                  <h3 className="font-medium text-black mb-3">Export Formats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleQuickExport(shareDocument, 'pdf')}
                      disabled={isExporting}
                      className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
                    >
                      <FileType className="h-4 w-4" />
                      <span>Export as PDF</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleQuickExport(shareDocument, 'md')}
                      disabled={isExporting}
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Export as Markdown</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleQuickExport(shareDocument, 'html')}
                      disabled={isExporting}
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Export as HTML</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleQuickExport(shareDocument, 'txt')}
                      disabled={isExporting}
                      variant="outline"
                      className="flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Export as Text</span>
                    </Button>
                  </div>
                </div>

                {/* Document Preview */}
                <div>
                  <h3 className="font-medium text-black mb-2">Document Preview</h3>
                  <Card className="p-4 bg-gray-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={getTypeColor(shareDocument.type)}>
                          {shareDocument.type}
                        </Badge>
                        <span className="text-gray-500">
                          {new Date(shareDocument.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{shareDocument.description}</p>
                      <div className="text-xs text-gray-500">
                        {shareDocument.content.length} characters • Created by {shareDocument.createdBy}
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedDocument(shareDocument);
                      setIsShareDialogOpen(false);
                    }}
                    className="bg-ocean-blue hover:bg-ocean-blue/90"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Document
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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