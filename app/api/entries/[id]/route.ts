import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/lib/models/entry";
/* import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    } */

    await dbConnect();

    /* const userId = session.user.id */
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";
    const entry = await Entry.findOne({ _id: params.id, userId });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Erro ao buscar entrada:", error);
    return NextResponse.json(
      { error: "Erro ao buscar entrada" },
      { status: 500 }
    );
  }
}

/* export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const userId = session.user.id

    const entry = await Entry.findOneAndUpdate(
      { _id: params.id, userId },
      {
        ...body,
        date: new Date(body.date),
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Erro ao atualizar entrada:", error)
    return NextResponse.json({ error: "Erro ao atualizar entrada" }, { status: 500 })
  }
} */

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    } */

    await dbConnect();

    /* const userId = session.user.id */
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";

    const entry = await Entry.findOneAndDelete({ _id: params.id, userId });

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir entrada:", error);
    return NextResponse.json(
      { error: "Erro ao excluir entrada" },
      { status: 500 }
    );
  }
}
