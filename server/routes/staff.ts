import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/index";
import { staff } from "../db/schema/staff";

const router = Router();

/** GET /api/staff — public endpoint returning active staff for the team page */
router.get("/", async (_req, res) => {
  try {
    const members = await db
      .select({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        roleTitle: staff.roleTitle,
        photoUrl: staff.photoUrl,
        bio: staff.bio,
        showEmail: staff.showEmail,
        showPhone: staff.showPhone,
        sortOrder: staff.sortOrder,
        focalPointX: staff.focalPointX,
        focalPointY: staff.focalPointY,
      })
      .from(staff)
      .where(eq(staff.active, true))
      .orderBy(asc(staff.sortOrder), asc(staff.name));

    const publicMembers = members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.showEmail !== false ? m.email : null,
      phone: m.showPhone !== false ? m.phone : null,
      roleTitle: m.roleTitle,
      photoUrl: m.photoUrl,
      bio: m.bio,
      focalPointX: m.focalPointX ?? 50,
      focalPointY: m.focalPointY ?? 25,
    }));

    res.json({ staff: publicMembers });
  } catch (error) {
    console.error("[staff] Public endpoint error:", error);
    // Fallback: try basic query without new columns (pre-migration compatibility)
    try {
      const members = await db
        .select({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          roleTitle: staff.roleTitle,
          photoUrl: staff.photoUrl,
          bio: staff.bio,
        })
        .from(staff)
        .where(eq(staff.active, true))
        .orderBy(asc(staff.name));

      const publicMembers = members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        roleTitle: m.roleTitle,
        photoUrl: m.photoUrl,
        bio: m.bio,
        focalPointX: 50,
        focalPointY: 25,
      }));

      res.json({ staff: publicMembers });
    } catch {
      res.status(500).json({ error: "Hiba történt a munkatársak betöltésekor." });
    }
  }
});

export default router;
