"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, User, Building2, MapPin, Package, CreditCard } from "lucide-react";

type WorkspaceUser = { id: string; name: string; email: string; role: string };

const COUNTRIES = ["India","United States","United Kingdom","Canada","Australia","Germany","France","UAE","Singapore","Other"];
const PAYMENT_TERMS = ["Net 7","Net 15","Net 30","Net 45","Net 60","Due on Receipt","Custom"];
const SCHEMES = ["GLN","DUNS","LEI","EAN","Other"];

export default function CreateCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [form, setForm] = useState({
    // User link
    userId: "",
    // Basic info
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    taxNumber: "",
    paymentTerms: "",
    // Billing
    billingName: "",
    billingAddress: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZip: "",
    electronicAddress: "",
    electronicAddressScheme: "",
    // Shipping
    shippingName: "",
    shippingAddress: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingZip: "",
    // Other
    notes: "",
    creditLimit: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Load workspace users
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  // Auto-fill billing name from company name
  useEffect(() => {
    if (form.companyName && !form.billingName) {
      set("billingName", form.companyName);
    }
  }, [form.companyName]);

  const handleSubmit = async () => {
    setError("");
    if (!form.companyName.trim()) { setError("Company name is required"); return; }
    if (!form.billingName.trim()) { setError("Billing name is required"); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        shippingSameAsBilling: sameAsBilling,
        // If same as billing, copy billing to shipping
        ...(sameAsBilling ? {
          shippingName: form.billingName,
          shippingAddress: form.billingAddress,
          shippingAddress2: form.billingAddress2,
          shippingCity: form.billingCity,
          shippingState: form.billingState,
          shippingCountry: form.billingCountry,
          shippingZip: form.billingZip,
        } : {}),
      };

      const res = await fetch("/api/sales/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create customer"); return; }
      router.push("/dashboard/accounting/customers");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, field, type = "text", placeholder = "", required = false }: {
    label: string; field: string; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={(form as any)[field] || ""}
        onChange={(e) => set(field, e.target.value)}
      />
    </div>
  );

  return (
    <DashboardLayout title="Create Customer">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/accounting/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Customer</h1>
            <p className="text-sm text-muted-foreground">Add a new customer to your accounting system</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* ─── User Link ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">User</label>
              <select
                value={form.userId}
                onChange={(e) => {
                  const u = users.find((u) => u.id === e.target.value);
                  set("userId", e.target.value);
                  if (u && !form.contactPerson) set("contactPerson", u.name);
                  if (u && !form.email) set("email", u.email);
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No User Selected</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Note: Only workspace users will appear in this list. Selecting a user auto-fills contact details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Basic Info ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Company & Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Company Name" field="companyName" placeholder="e.g. Acme Corp" required />
              <InputField label="Contact Person" field="contactPerson" placeholder="e.g. John Doe" />
              <InputField label="Email" field="email" type="email" placeholder="billing@company.com" required />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Format: +[country code][phone number]</p>
              </div>
              <InputField label="Tax Number" field="taxNumber" placeholder="GST / VAT / PAN" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Terms</label>
                <select
                  value={form.paymentTerms}
                  onChange={(e) => set("paymentTerms", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select payment terms</option>
                  {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Billing Address ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Billing Name" field="billingName" placeholder="Name on invoice" required />
              <InputField label="Billing Address" field="billingAddress" placeholder="Street address" />
              <InputField label="Address Line 2" field="billingAddress2" placeholder="Apt, Suite, Floor..." />
              <InputField label="City" field="billingCity" placeholder="City" required />
              <InputField label="State" field="billingState" placeholder="State / Province" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country <span className="text-destructive">*</span></label>
                <select
                  value={form.billingCountry}
                  onChange={(e) => set("billingCountry", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <InputField label="Zip Code" field="billingZip" placeholder="PIN / ZIP" required />
            </div>

            {/* Electronic Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
              <InputField label="Electronic Address" field="electronicAddress" placeholder="e-invoice address" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Electronic Address Scheme</label>
                <select
                  value={form.electronicAddressScheme}
                  onChange={(e) => set("electronicAddressScheme", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select scheme</option>
                  {SCHEMES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Shipping Address ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" /> Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Same as billing toggle */}
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm font-medium">Shipping address same as billing</span>
            </label>

            {!sameAsBilling && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Shipping Name" field="shippingName" placeholder="Name" required />
                <InputField label="Shipping Address" field="shippingAddress" placeholder="Street address" required />
                <InputField label="Address Line 2" field="shippingAddress2" placeholder="Apt, Suite, Floor..." />
                <InputField label="City" field="shippingCity" placeholder="City" required />
                <InputField label="State" field="shippingState" placeholder="State / Province" />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Country <span className="text-destructive">*</span></label>
                  <select
                    value={form.shippingCountry}
                    onChange={(e) => set("shippingCountry", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <InputField label="Zip Code" field="shippingZip" placeholder="PIN / ZIP" required />
              </div>
            )}

            {sameAsBilling && (
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
                ✅ Shipping address will be same as billing address
              </p>
            )}
          </CardContent>
        </Card>

        {/* ─── Notes & Credit ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Additional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="Any additional notes about this customer..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <label className="text-sm font-medium">Credit Limit ($)</label>
              <Input
                type="number"
                min={0}
                placeholder="0 = unlimited"
                value={form.creditLimit}
                onChange={(e) => set("creditLimit", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ─── Actions ─── */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/accounting/customers")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Create Customer"}
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}
