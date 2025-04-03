import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/lib/models/entry";
/* import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" */

export async function GET(req: NextRequest) {
  try {
    /* const session = await getServerSession(authOptions) */

    /* if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    } */

    await dbConnect();
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";
    /* const userId = session.user.id */
    const url = new URL(req.url);

    // Parâmetros de consulta
    const dataTypeId = url.searchParams.get("dataTypeId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Construir a consulta
    const query: any = { userId };

    if (dataTypeId) {
      query.dataTypeId = dataTypeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    const entries = await Entry.find(query).sort({ date: -1 });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar registros" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    /* const session = await getServerSession(authOptions) */

    /* if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    } */

    await dbConnect();

    const body = await req.json();
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";
    /* const userId = session.user.id */

    const entry = new Entry({
      ...body,
      userId,
      date: new Date(body.date),
    });

    await entry.save();

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar entrada:", error);
    return NextResponse.json(
      { error: "Erro ao criar entrada" },
      { status: 500 }
    );
  }
}
