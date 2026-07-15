"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, User, Building2, Phone, Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ProfileData = {
  id: string;
  name?: string | null;
  email?: string;
  phone?: string | null;
  image?: string | null;
  companyName?: string | null;
  role?: string;
  createdAt?: string;
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700",
  ADMIN: "bg-purple-500/10 text-purple-700",
  MANAGER: "bg-blue-500/10 text-blue-700",
  STAFF: "bg-green-500/10 text-green-700",
};

export default function DashboardProfilePage() {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUserData(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          setCompanyName(data.user.companyName || "");
        }
      })
      .catch(console.error);
  }, []);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const patchRes = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: data.url }),
        });
        if (patchRes.ok) {
          setUserData((prev) => prev ? { ...prev, image: data.url } : prev);
          showMsg("Profile photo updated successfully", "success");
        }
      } else {
        showMsg(data.error || "Upload failed", "error");
      }
    } catch {
      showMsg("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { showMsg("Name cannot be empty", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, companyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData((prev) => prev ? { ...prev, name, phone, companyName } : prev);
        showMsg("Profile updated successfully", "success");
      } else {
        showMsg(data.error || "Failed to update profile", "error");
      }
    } catch {
      showMsg("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMsg("Please fill all password fields", "error"); return;
    }
    if (newPassword !== confirmPassword) {
      showMsg("Passwords do not match", "error"); return;
    }
    if (newPassword.length < 6) {
      showMsg("New password must be at least 6 characters", "error"); return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Password changed successfully", "success");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        showMsg(data.error || "Failed to change password", "error");
      }
    } catch {
      showMsg("Network error", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <DashboardLayout title="Edit Profile" user={userData}>
      <div className="space-y-6 max-w-4xl">

        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Avatar + basic info */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
              {/* Avatar */}
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold overflow-hidden ring-4 ring-primary/10">
                  {userData?.image ? (
                    <img src={userData.image} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadAvatar}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Click on avatar to change photo
              </p>

              {/* Info */}
              <div className="w-full space-y-2 pt-2 border-t border-border">
                <p className="font-semibold">{name || "—"}</p>
                <p className="text-sm text-muted-foreground">{userData?.email}</p>
                {userData?.role && (
                  <Badge className={roleColors[userData.role] || "bg-gray-100 text-gray-700"}>
                    {userData.role.replace("_", " ")}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="w-full pt-2 border-t border-border grid grid-cols-1 gap-2 text-left">
                {userData?.companyName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{userData.companyName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{userData?.email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Joined{" "}
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right — Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Info Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={userData?.email || ""}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Change Password Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={changingPassword} variant="outline">
                    {changingPassword && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
