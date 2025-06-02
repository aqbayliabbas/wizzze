'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase, PortfolioItem } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ImageIcon, PlayIcon } from 'lucide-react';

export default function Portfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaType: 'image' as 'image' | 'video',
    file: null as File | null,
  });
  
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setPortfolioItems(data || []);
        
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load portfolio items',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPortfolioItems();
    }
  }, [user, toast]);
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      mediaType: 'image',
      file: null,
    });
    setEditingItem(null);
  };
  
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };
  
  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      mediaType: item.media_type,
      file: null,
    });
    setDialogOpen(true);
  };
  
  const handleDeleteItem = async () => {
    if (!deletingItemId) return;
    
    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', deletingItemId);
        
      if (error) {
        throw error;
      }
      
      // Also delete the file from storage
      const itemToDelete = portfolioItems.find(item => item.id === deletingItemId);
      if (itemToDelete) {
        const filePath = itemToDelete.media_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('portfolio')
            .remove([filePath]);
        }
      }
      
      setPortfolioItems((prev) => prev.filter(item => item.id !== deletingItemId));
      
      toast({
        title: 'Item deleted',
        description: 'Portfolio item has been deleted successfully',
      });
      
    } catch (error: any) {
      console.error('Error deleting portfolio item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete portfolio item',
        variant: 'destructive',
      });
    } finally {
      setDeletingItemId(null);
      setDeleteDialogOpen(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage && formData.mediaType === 'image') {
        setFormData({ ...formData, file });
      } else if (isVideo && formData.mediaType === 'video') {
        setFormData({ ...formData, file });
      } else {
        toast({
          title: 'Invalid file type',
          description: `Please upload a ${formData.mediaType} file`,
          variant: 'destructive',
        });
        e.target.value = '';
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.title) {
      toast({
        title: 'Missing title',
        description: 'Please provide a title for your portfolio item',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setFileUploading(true);
      
      // For editing without a new file upload
      if (editingItem && !formData.file) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({
            title: formData.title,
            description: formData.description,
          })
          .eq('id', editingItem.id);
          
        if (error) {
          throw error;
        }
        
        setPortfolioItems((prev) => prev.map(item => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              title: formData.title,
              description: formData.description,
            };
          }
          return item;
        }));
        
        toast({
          title: 'Portfolio updated',
          description: 'Your portfolio item has been updated',
        });
        
        handleDialogOpenChange(false);
        return;
      }
      
      // Require file for new uploads
      if (!formData.file && !editingItem) {
        toast({
          title: 'Missing file',
          description: 'Please upload a file for your portfolio item',
          variant: 'destructive',
        });
        return;
      }
      
      let mediaUrl = editingItem?.media_url;
      
      // Handle file upload if there's a new file
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('portfolio')
          .upload(filePath, formData.file, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);
          
        mediaUrl = data.publicUrl;
      }
      
      if (!mediaUrl) {
        throw new Error('Failed to get media URL');
      }
      
      if (editingItem) {
        // Update existing portfolio item
        const { error } = await supabase
          .from('portfolio_items')
          .update({
            title: formData.title,
            description: formData.description,
            media_url: mediaUrl,
            media_type: formData.mediaType,
          })
          .eq('id', editingItem.id);
          
        if (error) {
          throw error;
        }
        
        setPortfolioItems((prev) => prev.map(item => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              title: formData.title,
              description: formData.description,
              media_url: mediaUrl,
              media_type: formData.mediaType,
            };
          }
          return item;
        }));
        
        toast({
          title: 'Portfolio updated',
          description: 'Your portfolio item has been updated',
        });
        
      } else {
        // Create new portfolio item
        const { data, error } = await supabase
          .from('portfolio_items')
          .insert({
            creator_id: user.id,
            title: formData.title,
            description: formData.description,
            media_url: mediaUrl,
            media_type: formData.mediaType,
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        setPortfolioItems((prev) => [data, ...prev]);
        
        toast({
          title: 'Portfolio updated',
          description: 'New portfolio item has been added',
        });
      }
      
      handleDialogOpenChange(false);
      
    } catch (error: any) {
      console.error('Error saving portfolio item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save portfolio item',
        variant: 'destructive',
      });
    } finally {
      setFileUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Showcase your best work to attract brands
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</DialogTitle>
              <DialogDescription>
                {editingItem 
                  ? 'Update your portfolio item details' 
                  : 'Add a new item to showcase your work to brands'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select
                    value={formData.mediaType}
                    onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, mediaType: value })}
                    disabled={!!editingItem}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Product Lifestyle Photo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this piece of work"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">{editingItem ? 'Replace File (optional)' : 'Upload File'}</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.mediaType === 'image' 
                      ? 'Accepted formats: JPG, PNG, GIF (max 10MB)' 
                      : 'Accepted formats: MP4, WebM (max 100MB)'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={fileUploading}>
                  {fileUploading 
                    ? 'Uploading...' 
                    : editingItem 
                      ? 'Save Changes' 
                      : 'Add to Portfolio'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : portfolioItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {item.media_type === 'image' ? (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PlayIcon className="w-12 h-12 text-muted-foreground" />
                    <a 
                      href={item.media_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0"
                    >
                      <span className="sr-only">Play video</span>
                    </a>
                  </div>
                )}
              </div>
              <CardContent className="flex-1 p-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </CardContent>
              <div className="p-4 pt-0 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditItem(item)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setDeletingItemId(item.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Your portfolio is empty</p>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Portfolio Item
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this portfolio item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}