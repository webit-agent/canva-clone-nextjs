import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { pool } from "@/lib/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminCheck = await isAdmin(session.user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const templateId = params.id;

    const client = await pool.connect();
    try {
      // Check if template exists and is actually a template
      const checkResult = await client.query(
        'SELECT id FROM projects WHERE id = $1 AND is_template = true',
        [templateId]
      );

      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      // Delete the template
      await client.query(
        'DELETE FROM projects WHERE id = $1 AND is_template = true',
        [templateId]
      );

      return NextResponse.json({
        message: "Template deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
