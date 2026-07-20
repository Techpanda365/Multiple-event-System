import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return success({ coupons });
}

// src/app/api/admin/coupons/route.ts

export async function POST(request: Request) {
  try {
    const ctx = await requireAdminSession();
    if (!ctx) return unauthorized();

    const body = await request.json();
    
    const {
      name,
      code,
      type,
      discount,
      usageLimit,
      limitPerUser,
      minSpend,
      maxSpend,
      description,
      expiryDate,
    } = body;

    // Validate required fields
    if (!name || !code || !type || discount === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert and validate numeric fields
    const parsedDiscount = parseFloat(discount);
    if (isNaN(parsedDiscount) || parsedDiscount < 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid discount: must be a positive number" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle optional numeric fields - convert empty strings to null
    const parsedUsageLimit = usageLimit && usageLimit !== '' ? parseInt(usageLimit, 10) : null;
    const parsedLimitPerUser = limitPerUser && limitPerUser !== '' ? parseInt(limitPerUser, 10) : null;
    const parsedMinSpend = minSpend && minSpend !== '' ? parseFloat(minSpend) : null;
    const parsedMaxSpend = maxSpend && maxSpend !== '' ? parseFloat(maxSpend) : null;

    // Validate that optional fields are valid numbers if provided
    if (usageLimit && usageLimit !== '' && isNaN(parsedUsageLimit!)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid usageLimit: must be a number" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (limitPerUser && limitPerUser !== '' && isNaN(parsedLimitPerUser!)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid limitPerUser: must be a number" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (minSpend && minSpend !== '' && isNaN(parsedMinSpend!)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid minSpend: must be a number" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (maxSpend && maxSpend !== '' && isNaN(parsedMaxSpend!)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid maxSpend: must be a number" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate minSpend <= maxSpend if both are provided
    if (parsedMinSpend !== null && parsedMaxSpend !== null && parsedMinSpend > parsedMaxSpend) {
      return new Response(
        JSON.stringify({ success: false, error: "minSpend cannot be greater than maxSpend" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon code already exists
    const codeExists = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (codeExists) {
      return new Response(
        JSON.stringify({ success: false, error: "Coupon code already exists" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create coupon with proper types
    const coupon = await prisma.coupon.create({
      data: {
        name,
        code: code.toUpperCase(),
        type: type.toUpperCase(),
        discount: parsedDiscount,
        usageLimit: parsedUsageLimit,
        limitPerUser: parsedLimitPerUser,
        minSpend: parsedMinSpend,
        maxSpend: parsedMaxSpend,
        description: description || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true,
      },
    });

    return new Response(
      JSON.stringify({ success: true, data: coupon }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to create coupon" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
