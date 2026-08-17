import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";
export async function POST(request: NextRequest) { try { const user=await getCurrentUserFromRequest(request); const {userId}=await request.json(); if(typeof userId!=="string") throw new Error("Foydalanuvchi topilmadi"); const {error}=await createSupabaseServerClient().from("user_blocks").upsert({blocker_id:user.id,blocked_id:userId}); if(error) throw error; return NextResponse.json({ok:true}); } catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"Bloklab bo‘lmadi"},{status:400}); } }
