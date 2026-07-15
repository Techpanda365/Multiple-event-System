"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Printer, Barcode as BarcodeIcon, Search, Plus, Minus } from "lucide-react";

type Product = { id: string; name: string; sku: string | null; price: number };

function BarcodeSVG({ code, width = 140 }: { code: string; width?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) {
      import("jsbarcode").then((mod) => {
        const JsBarcode = mod.default || mod;
        try { JsBarcode(ref.current, code, { format: "CODE128", width: 1.5, height: 40, displayValue: false, margin: 4 }); } catch {}
      });
    }
  }, [code]);
  return <svg ref={ref} style={{ width, height: 48 }} />;
}

export default function BarcodePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiesMap, setCopiesMap] = useState<Record<string, number>>({});
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => { setProducts(Array.isArray(data) ? data : []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false);
  });

  const getCopies = (id: string) => copiesMap[id] || 1;
  const setCopies = (id: string, n: number) => setCopiesMap((prev) => ({ ...prev, [id]: Math.max(0, Math.min(50, n)) }));

  const selectedProducts = filtered.filter((p) => (copiesMap[p.id] || 0) > 0);
  const totalSelected = selectedProducts.reduce((s, p) => s + getCopies(p.id), 0);

  const handlePrint = () => {
    if (!printRef.current || selectedProducts.length === 0) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Barcode Print</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; }
        .barcode-item { display: inline-block; margin: 8px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; text-align: center; }
        .barcode-item svg { display: block; margin: 0 auto; }
        .product-name { font-size: 11px; margin-top: 4px; color: #555; }
        .product-price { font-size: 13px; font-weight: bold; margin-top: 2px; }
        @media print { @page { margin: 8mm; } }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <DashboardLayout title="Manage Product Barcode">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Product Barcode Generator</h1>
          <p className="text-sm text-muted-foreground">Select products, set copies, and print barcodes</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">{filtered.length} products</span>
          {selectedProducts.length > 0 && (
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
              {totalSelected} barcode{totalSelected > 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <BarcodeIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Product Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">SKU</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Price</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Barcode</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase w-32">Copies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((p) => {
                      const code = (p.sku || p.id.slice(0, 8)).toUpperCase();
                      const copies = getCopies(p.id);
                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-medium">{p.name}</td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{p.sku || "—"}</td>
                          <td className="py-3 px-4 text-right font-semibold">${p.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <BarcodeSVG code={code} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setCopies(p.id, copies - 1)}
                                className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-muted transition-colors">
                                <Minus className="h-3 w-3" />
                              </button>
                              <input type="number" min={0} max={50} value={copies}
                                onChange={(e) => setCopies(p.id, Number(e.target.value))}
                                className="h-7 w-14 text-center rounded border border-input bg-background text-sm" />
                              <button onClick={() => setCopies(p.id, copies + 1)}
                                className="h-7 w-7 rounded border border-input flex items-center justify-center hover:bg-muted transition-colors">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedProducts.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div ref={printRef} className="flex flex-wrap gap-4 mb-4 justify-center">
                {selectedProducts.map((p) => {
                  const code = (p.sku || p.id.slice(0, 8)).toUpperCase();
                  const copies = getCopies(p.id);
                  return Array.from({ length: copies }).map((_, i) => (
                    <div key={`${p.id}-${i}`} className="border rounded-lg p-3 text-center" style={{ minWidth: 160 }}>
                      <BarcodeSVG code={code} width={150} />
                      <div className="text-xs mt-1 text-muted-foreground">{p.name}</div>
                      <div className="text-sm font-bold mt-0.5">${p.price.toFixed(2)}</div>
                    </div>
                  ));
                })}
              </div>
              <Button className="w-full" onClick={handlePrint} size="lg">
                <Printer className="h-5 w-5 mr-2" />Print Barcodes ({totalSelected})
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
