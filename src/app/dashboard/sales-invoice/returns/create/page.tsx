// app/dashboard/sales-invoice/returns/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Warehouse,
  FileText,
  Package,
  X,
  Check,
  AlertCircle
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  invoiceDate: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  selected: boolean;
}

export default function CreateSalesReturnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    originalInvoice: "",
    warehouse: "",
    returnReason: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/sales/invoices").then((r) => r.ok ? r.json() : []),
      fetch("/api/purchase/warehouses").then((r) => r.ok ? r.json() : []),
    ]).then(([invData, whData]) => {
      setInvoices(Array.isArray(invData) ? invData : []);
      setWarehouses(Array.isArray(whData) ? whData : []);
    });
  }, []);

  const toggleItemSelection = (itemId: string) => {
    setInvoiceItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, selected: !item.selected } : item
      );
      const count = updated.filter(item => item.selected).length;
      setSelectedCount(count);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedItems = invoiceItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert("Please select at least one item to return");
      return;
    }

    setLoading(true);
    
    const selInv = invoices.find(i => i.id === formData.originalInvoice);
    const selWh = warehouses.find(w => w.id === formData.warehouse);
    const returnData = {
      invoiceId: formData.originalInvoice,
      customerName: selInv?.customerName || "",
      warehouseId: formData.warehouse,
      warehouseName: selWh?.name || "",
      returnDate: formData.returnDate,
      reason: formData.returnReason,
      notes: formData.notes,
      items: selectedItems.map(({ selected, ...item }) => item),
    };

    try {
      const response = await fetch("/api/sales/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        router.push("/dashboard/sales-invoice/returns");
      }
    } catch (error) {
      console.error("Failed to create return:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = async (invoiceId: string) => {
    setFormData({ ...formData, originalInvoice: invoiceId });
    setSelectedCount(0);
    if (!invoiceId) { setInvoiceItems([]); return; }
    try {
      const res = await fetch(`/api/sales/invoices/${invoiceId}`);
      if (res.ok) {
        const inv = await res.json();
        const items = (inv.items || []).map((item: any, i: number) => {
          const qty = item.qty || item.quantity || 0;
          const price = item.unitPrice || 0;
          const lineTotal = qty * price;
          const discPct = item.discount || 0;
          const taxPct = item.tax || 0;
          const discAmt = lineTotal * (discPct / 100);
          const taxAmt = (lineTotal - discAmt) * (taxPct / 100);
          return {
            id: String(i),
            product: item.product || "",
            quantity: qty,
            unitPrice: price,
            discount: discPct,
            tax: taxPct,
            total: lineTotal - discAmt + taxAmt,
            selected: false,
          };
        });
        setInvoiceItems(items);
      }
    } catch (e) {
      console.error("Failed to load invoice items", e);
      setInvoiceItems([]);
    }
  };

  return (
    <DashboardLayout title="Create Sales Return">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Sales Return</h1>
            <p className="text-sm text-muted-foreground">Create a new sales return</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-base mb-4">Sales Return Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Return Date */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Return Date <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="date"
                          className="pl-9"
                          value={formData.returnDate}
                          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Original Invoice */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Original Invoice <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select 
                          className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={formData.originalInvoice}
                          onChange={(e) => handleInvoiceChange(e.target.value)}
                          required
                        >
                          <option value="">Select Invoice</option>
                          {invoices.map(inv => (
                            <option key={inv.id} value={inv.id}>
                              {inv.invoiceNumber} - {inv.customerName} (${inv.total})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Warehouse */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Warehouse <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select 
                          className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={formData.warehouse}
                          onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                          required
                        >
                          <option value="">Select Warehouse</option>
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Return Reason */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Return Reason <span className="text-destructive">*</span>
                      </label>
                      <select 
                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={formData.returnReason}
                        onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                        required
                      >
                        <option value="">Select Reason</option>
                        <option value="Defective">Defective</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Wrong Item">Wrong Item</option>
                        <option value="Wrong Size">Wrong Size</option>
                        <option value="Wrong Color">Wrong Color</option>
                        <option value="Customer Request">Customer Request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-1.5">Notes</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        placeholder="Additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items Selection */}
              {formData.originalInvoice && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-base">Invoice Items</h3>
                      <span className="text-sm text-muted-foreground">
                        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for return
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th className="text-left p-3 font-medium text-xs text-muted-foreground uppercase">Product</th>
                            <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Available Qty</th>
                            <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Unit Price</th>
                            <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Discount</th>
                            <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Tax</th>
                            <th className="text-right p-3 font-medium text-xs text-muted-foreground uppercase">Total</th>
                            <th className="text-center p-3 font-medium text-xs text-muted-foreground uppercase">Select</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                No items found for this invoice
                              </td>
                            </tr>
                          ) : (
                            invoiceItems.map((item) => (
                              <tr key={item.id} className="border-b border-border hover:bg-muted/5">
                                <td className="p-3 font-medium">{item.product}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                                <td className="p-3 text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                                <td className="p-3 text-right">{item.tax > 0 ? `${item.tax}%` : '-'}</td>
                                <td className="p-3 text-right font-semibold">${item.total.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleItemSelection(item.id)}
                                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                      item.selected 
                                        ? "border-primary bg-primary text-white" 
                                        : "border-muted-foreground/30 hover:border-primary"
                                    }`}
                                  >
                                    {item.selected && <Check className="h-3.5 w-3.5" />}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {selectedCount > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-muted/30 border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for return
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          Total: ${invoiceItems
                            .filter(item => item.selected)
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-base mb-4">Return Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Return Date</span>
                      <span className="font-medium">
                        {formData.returnDate ? new Date(formData.returnDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice</span>
                      <span className="font-medium">
                        {formData.originalInvoice 
                          ? invoices.find(inv => inv.id === formData.originalInvoice)?.invoiceNumber 
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Warehouse</span>
                      <span className="font-medium">
                        {formData.warehouse 
                          ? warehouses.find(w => w.id === formData.warehouse)?.name 
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items Selected</span>
                      <span className="font-medium">{selectedCount}</span>
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Return Amount</span>
                        <span className="text-xl font-bold text-primary">
                          ${invoiceItems
                            .filter(item => item.selected)
                            .reduce((sum, item) => sum + item.total, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full gap-1.5"
                  disabled={loading || selectedCount === 0}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                  Create Return
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}