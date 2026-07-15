"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Settings, Lock, Zap, CreditCard, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

const settingsGroups = [
  {
    title: "Settings",
    icon: Settings,
    group: "general",
    items: [
      "Brand Settings", "System Settings", "Currency Settings", "Cookie Settings",
      "Pusher Settings", "SEO Settings", "Cache Settings", "Storage Settings",
      "Recurring Invoice Settings", "Reminder Settings", "Email Settings",
      "Email Notification Settings"
    ]
  },
  {
    title: "Integrations",
    icon: Zap,
    group: "integrations",
    items: [
      "Zapier Settings", "Google reCAPTCHA Settings", "Make Settings",
      "n8n Settings", "Webhook Settings", "Pabbly Connect Settings",
      "Google Analytics Settings", "WHMCS Settings"
    ]
  },
  {
    title: "Social Login",
    icon: Lock,
    group: "social",
    items: [
      "Sign-In With GitHub Settings", "Sign-In With Bitbucket Settings",
      "Sign-In With LinkedIn Settings", "Sign-In With Twitter Settings",
      "Sign-In With Google Settings", "Sign-In With Facebook Settings",
      "Sign-In With Slack Settings", "Sign-In With Outlook Settings",
      "Sign-In With Microsoft Settings"
    ]
  },
  {
    title: "Payment Gateways",
    icon: CreditCard,
    group: "payment",
    items: [
      "Bank Transfer Settings", "Stripe Settings", "PayPal Settings",
      "Flutterwave Settings", "Paystack Settings", "Razorpay Settings",
      "Mollie Settings", "Payfast Settings", "YooKassa Settings",
      "PayTab Settings", "Toyyibpay Settings", "Skrill Settings",
      "Iyzipay Settings", "PayTR Settings", "Aamarpay Settings",
      "Benefit Settings", "Cashfree Settings", "Coingate Settings",
      "Mercado Settings", "Paytm Settings", "Midtrans Settings",
      "Xendit Settings", "Tap Settings", "Khalti Settings",
      "PhonePe Settings", "AuthorizeNet Settings", "PayHere Settings",
      "PaiementPro Settings", "FedaPay Settings", "CinetPay Settings",
      "SenangPay Settings", "CyberSource Settings", "Ozow Settings",
      "2Checkout Settings", "Easebuzz Settings", "Square Settings",
      "Braintree Settings", "PayU Settings", "Instamojo Settings",
      "Esewa Settings", "Paynow Settings", "MyFatoorah Settings",
      "Fatora Settings", "Yoco Settings", "Moyasar Settings",
      "NMI Settings", "PowerTranz Settings", "DPOPay Settings",
      "Monnify Settings", "UddoktaPay Settings", "Moneris Settings",
      "PayPay Settings", "Pesapal Settings", "Checkout Settings",
      "BTC Pay Settings", "PayFort Settings", "BlueSnap Settings",
      "LinePay Settings", "BitPay Settings", "Peach Payment Settings",
      "SSLCommerz Settings", "Adyen Settings"
    ]
  }
];

function settingKey(settingName: string): string {
  return settingName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_settings$/, "");
}

function settingGroup(settingName: string): string {
  const found = settingsGroups.find((g) => g.items.includes(settingName));
  return found?.group || "general";
}

export default function AdminSettingsPage() {
  const [userData, setUserData] = useState<{ name?: string; email?: string; image?: string; role?: string } | null>(null);
  const [selected, setSelected] = useState("Brand Settings");
  const [settings, setSettings] = useState<Record<string, Record<string, string>>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Settings": true,
    "Integrations": false,
    "Social Login": false,
    "Payment Gateways": false,
  });

  const fetchSettings = async () => {
    try {
      const [sessionData, settingsData] = await Promise.all([
        fetch("/api/checksession").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()),
      ]);
      if (sessionData.user) setUserData(sessionData.user);
      setSettings(settingsData.settings || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const group = settingGroup(selected);
    const groupSettings = settings[group] || {};
    const key = settingKey(selected);
    const currentVals: Record<string, string> = {};
    Object.entries(groupSettings).forEach(([k, v]) => {
      currentVals[k] = typeof v === "string" ? v : JSON.stringify(v);
    });
    if (!currentVals[key] && !currentVals[`${key}_enabled`]) {
      currentVals[`${key}_enabled`] = "true";
    }
    setFormValues(currentVals);
  }, [selected, settings]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const group = settingGroup(selected);
    try {
      for (const [key, value] of Object.entries(formValues)) {
        await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, group }),
        });
      }
      setMessage("Settings saved successfully");
      fetchSettings();
    } catch (err) {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings" user={userData}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" user={userData}>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-border pr-4 space-y-1">
          {settingsGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups[group.title];
            return (
              <div key={group.title}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <GroupIcon className="h-4 w-4" />
                  <span className="flex-1 text-left">{group.title}</span>
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                {isExpanded && (
                  <div className="ml-2 space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => setSelected(item)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                          selected === item
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">{selected}</h2>
              <p className="text-muted-foreground">Configure {selected.toLowerCase()}</p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{selected}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(formValues).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No settings configured yet.</p>
                ) : (
                  Object.entries(formValues).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-sm font-medium mb-1.5 block capitalize">{key.replace(/_/g, " ")}</label>
                      {key.endsWith("_enabled") ? (
                        <select
                          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          value={val}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [key]: e.target.value }))}
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : key.includes("secret") || key.includes("password") || key.includes("key") ? (
                        <Input
                          type="password"
                          value={val}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        />
                      ) : (
                        <Input
                          value={val}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        />
                      )}
                    </div>
                  ))
                )}
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
