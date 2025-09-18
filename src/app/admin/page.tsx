"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Users, 
  CreditCard, 
  FolderOpen, 
  Upload, 
  Eye,
  Trash2,
  Plus,
  Activity,
  Database,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CardDescription } from "@/components/ui/card";

interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  is_pro: boolean;
  thumbnail?: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalProjects: number;
  totalTemplates: number;
  proTemplates: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
  activeUsersToday: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: string;
  stripe_current_period_end?: string;
  created_at: string;
}

export default function AdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalProjects: 0,
    totalTemplates: 0,
    proTemplates: 0,
    newUsersThisMonth: 0,
    revenueThisMonth: 0,
    activeUsersToday: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showSubscriptionsDialog, setShowSubscriptionsDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    json: "",
    width: 900,
    height: 1200,
    is_pro: false,
    thumbnail: null as File | null,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, thumbnail: file });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.name || !uploadForm.json || !uploadForm.thumbnail) {
      toast.error("Please fill in all fields and select a thumbnail");
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append("name", uploadForm.name);
      formData.append("json", uploadForm.json);
      formData.append("width", uploadForm.width.toString());
      formData.append("height", uploadForm.height.toString());
      formData.append("is_pro", uploadForm.is_pro.toString());
      formData.append("thumbnail", uploadForm.thumbnail);

      const response = await fetch("/api/admin/templates", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Template uploaded successfully!");
        setUploadForm({
          name: "",
          json: "",
          width: 900,
          height: 1200,
          is_pro: false,
          thumbnail: null,
        });
        fetchTemplates();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload template");
      }
    } catch (error) {
      toast.error("Failed to upload template");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Template deleted successfully!");
        fetchTemplates();
        fetchStats();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  // Load templates and stats on component mount
  useEffect(() => {
    fetchTemplates();
    fetchStats();
    fetchUsers();
    fetchSubscriptions();
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your application and monitor key metrics</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => setShowUsersDialog(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      fetchSubscriptions();
                      setShowSubscriptionsDialog(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {stats.totalSubscriptions} total subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  User-created projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTemplates}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.proTemplates} Pro templates
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Row 2 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users This Month</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.revenueThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsersToday}</div>
                <p className="text-xs text-muted-foreground">
                  Users active in last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Upload Template Section */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Template
          </CardTitle>
          <CardDescription>
            Upload a new template JSON file to make it available to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={uploadForm.width}
                onChange={(e) => setUploadForm({ ...uploadForm, width: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={uploadForm.height}
                onChange={(e) => setUploadForm({ ...uploadForm, height: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="json">Template JSON</Label>
            <Textarea
              id="json"
              value={uploadForm.json}
              onChange={(e) => setUploadForm({ ...uploadForm, json: e.target.value })}
              placeholder="Paste your template JSON here..."
              rows={8}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={uploadForm.is_pro}
              onCheckedChange={(checked: boolean) => setUploadForm({ ...uploadForm, is_pro: checked })}
            />
            <Label htmlFor="is_pro">Pro Template</Label>
          </div>
          <Button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Template"}
          </Button>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Existing Templates ({templates.length})
          </CardTitle>
          <CardDescription>
            Manage existing templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No templates found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 space-y-2">
                  {template.thumbnail && (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.is_pro && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.width} × {template.height}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Users List ({stats.totalUsers} total)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name || "No name"}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscriptions Dialog */}
      <Dialog open={showSubscriptionsDialog} onOpenChange={setShowSubscriptionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscriptions List ({stats.totalSubscriptions} total)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{subscription.user_name || "No name"}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : subscription.status === 'canceled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{subscription.user_email}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Started: {new Date(subscription.created_at).toLocaleDateString()}</span>
                      {subscription.stripe_current_period_end && (
                        <span>Expires: {new Date(subscription.stripe_current_period_end).toLocaleDateString()}</span>
                      )}
                    </div>
                    {subscription.stripe_subscription_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {subscription.stripe_subscription_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
