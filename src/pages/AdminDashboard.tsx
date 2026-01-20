import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Mail, MessageSquare, Users, Shield, Clock, 
  CheckCircle, AlertCircle, Trash2, Eye, Loader2, RefreshCw,
  UserPlus, Crown, UserCheck, UserX, Activity, ClipboardList,
  TrendingUp, BarChart3
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
  full_name: string | null;
}

interface Statistics {
  totalAthletes: number;
  totalTeams: number;
  totalTestSessions: number;
  totalTestResults: number;
  athletesThisMonth: number;
  testsThisMonth: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalAthletes: 0,
    totalTeams: 0,
    totalTestSessions: 0,
    totalTestResults: 0,
    athletesThisMonth: 0,
    testsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

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

  // Fetch users with their roles
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setLoadingUsers(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Gagal memuat data pengguna');
        setLoadingUsers(false);
        return;
      }

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: '', // We don't have direct access to auth.users
          created_at: profile.created_at,
          role: userRole?.role || null,
          full_name: profile.full_name
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!isAdmin) return;
    
    setLoadingStats(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all stats in parallel
      const [
        athletesRes,
        teamsRes,
        sessionsRes,
        resultsRes,
        athletesMonthRes,
        sessionsMonthRes
      ] = await Promise.all([
        supabase.from('athletes').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('test_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('test_results').select('id', { count: 'exact', head: true }),
        supabase.from('athletes').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('test_sessions').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth)
      ]);

      setStats({
        totalAthletes: athletesRes.count || 0,
        totalTeams: teamsRes.count || 0,
        totalTestSessions: sessionsRes.count || 0,
        totalTestResults: resultsRes.count || 0,
        athletesThisMonth: athletesMonthRes.count || 0,
        testsThisMonth: sessionsMonthRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMessages();
      fetchUsers();
      fetchStatistics();
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
    // Update locally only since we don't have UPDATE policy for regular read
    setMessages(prev => 
      prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
    );
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user' | 'none') => {
    if (userId === user?.id) {
      toast.error('Anda tidak dapat mengubah role Anda sendiri');
      return;
    }

    setUpdatingRole(userId);
    try {
      if (newRole === 'none') {
        // Remove all roles for this user
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        
        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, role: null } : u)
        );
        toast.success('Role berhasil dihapus');
      } else {
        // Check if user already has a role
        const existingRole = users.find(u => u.id === userId)?.role;

        if (existingRole) {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
        }

        setUsers(prev => 
          prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
        );
        toast.success(`Role berhasil diubah menjadi ${newRole}`);
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Gagal mengubah role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600"><Crown className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Shield className="w-3 h-3 mr-1" />Moderator</Badge>;
      case 'user':
        return <Badge variant="secondary"><UserCheck className="w-3 h-3 mr-1" />User</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground"><UserX className="w-3 h-3 mr-1" />Belum ada role</Badge>;
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const totalCount = messages.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const totalUsers = users.length;

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
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalAthletes}</p>
                    <p className="text-xs text-muted-foreground">Total Atlet</p>
                  </div>
                </div>
                {stats.athletesThisMonth > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.athletesThisMonth} bulan ini
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTestSessions}</p>
                    <p className="text-xs text-muted-foreground">Total Tes</p>
                  </div>
                </div>
                {stats.testsThisMonth > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.testsThisMonth} bulan ini
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{totalUsers}</p>
                <p className="text-[10px] text-muted-foreground">Pengguna</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{stats.totalTeams}</p>
                <p className="text-[10px] text-muted-foreground">Tim</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{stats.totalTestResults}</p>
                <p className="text-[10px] text-muted-foreground">Hasil Tes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{totalCount}</p>
                <p className="text-[10px] text-muted-foreground">Pesan</p>
              </CardContent>
            </Card>
          </div>

          {/* Sub Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-orange-500/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">{unreadCount} pesan belum dibaca</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-500/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{adminCount} admin aktif</span>
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

            <TabsContent value="users" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Manajemen Pengguna</h3>
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loadingUsers}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada pengguna terdaftar</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <Card key={u.id} className={u.id === user?.id ? 'border-primary/50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {u.full_name || 'Pengguna'}
                                </p>
                                {u.id === user?.id && (
                                  <Badge variant="outline" className="text-[10px]">Anda</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Bergabung {format(new Date(u.created_at), 'dd MMM yyyy', { locale: idLocale })}
                              </p>
                              <div className="mt-1">
                                {getRoleBadge(u.role)}
                              </div>
                            </div>
                          </div>
                          
                          {u.id !== user?.id && (
                            <div className="shrink-0">
                              <Select
                                value={u.role || 'none'}
                                onValueChange={(value) => handleRoleChange(u.id, value as any)}
                                disabled={updatingRole === u.id}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  {updatingRole === u.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <SelectValue placeholder="Pilih Role" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Crown className="w-3 h-3 text-red-500" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="moderator">
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-3 h-3 text-blue-500" />
                                      Moderator
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="user">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="w-3 h-3" />
                                      User
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="none">
                                    <div className="flex items-center gap-2">
                                      <UserX className="w-3 h-3 text-muted-foreground" />
                                      Hapus Role
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
