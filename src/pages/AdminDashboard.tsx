import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Mail, MessageSquare, Users, Shield, Clock, 
  CheckCircle, AlertCircle, Trash2, Eye, Loader2, RefreshCw 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Gagal memuat pesan');
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMessages();
    }
  }, [isAdmin]);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    
    // Mark as read if not already
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const markAsRead = async (messageId: string) => {
    // Note: This would require UPDATE policy on contact_messages for admins
    // For now, we'll update locally only
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
    );
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const totalCount = messages.length;

  if (checkingRole) {
    return (
      <Layout>
        <Header title="Admin Dashboard" subtitle="Loading...">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Header title="Admin Dashboard" subtitle="Akses Ditolak">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-muted-foreground mb-4">
              Silakan login terlebih dahulu untuk mengakses halaman ini.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Login
            </Button>
          </div>
        </main>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Header title="Admin Dashboard" subtitle="Akses Ditolak">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Tidak Memiliki Akses</h2>
            <p className="text-muted-foreground mb-4">
              Anda tidak memiliki izin admin untuk mengakses halaman ini.
            </p>
            <Button onClick={() => navigate('/')}>
              Kembali ke Beranda
            </Button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Admin Dashboard" subtitle="Kelola Pesan & Pengguna">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Header>

      <main className="flex-1 overflow-auto">
        <div className="p-4 space-y-4 pb-24">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCount}</p>
                    <p className="text-xs text-muted-foreground">Total Pesan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                    <p className="text-xs text-muted-foreground">Belum Dibaca</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Pesan Masuk
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Pengguna
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pesan Kontak</h3>
                <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada pesan masuk</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <Card 
                      key={message.id} 
                      className={`cursor-pointer transition-colors hover:border-primary/50 ${!message.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{message.name}</p>
                              {!message.is_read && (
                                <Badge variant="default" className="text-[10px] h-5">Baru</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{message.email}</p>
                            {message.subject && (
                              <p className="text-sm font-medium mt-1 truncate">{message.subject}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message.message}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'dd MMM', { locale: idLocale })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Manajemen pengguna akan tersedia segera</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Detail Pesan
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Dari</p>
                  <p className="text-sm font-medium">{selectedMessage.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="text-sm">
                    {format(new Date(selectedMessage.created_at), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>
                {selectedMessage.subject && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Subjek</p>
                    <p className="text-sm font-medium">{selectedMessage.subject}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Pesan</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Pesan dari HIROCROSS'}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Balas
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
