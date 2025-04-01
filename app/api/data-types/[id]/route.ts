import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DataType from "@/lib/models/dataType";
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

    const { id } = await params;

    await dbConnect();

    const userId = "65f1a1b2c3d4e5f6a7b8c9d0"; /* session.user.id */
    const dataType = await DataType.findOne({ _id: id, userId });

    if (!dataType) {
      return NextResponse.json(
        { error: "Tipo de dado não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(dataType);
  } catch (error) {
    console.error("Erro ao buscar tipo de dado:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipo de dado" },
      { status: 500 }
    );
  }
}

/* export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const userId = session.user.id;

    const dataType = await DataType.findOneAndUpdate(
      { _id: params.id, userId },
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!dataType) {
      return NextResponse.json(
        { error: "Tipo de dado não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(dataType);
  } catch (error) {
    console.error("Erro ao atualizar tipo de dado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tipo de dado" },
      { status: 500 }
    );
  }
} */

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* const session = await getServerSession(authOptions); */

    /* if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    } */

    const id = await params.id;

    await dbConnect();

    /* const userId = session.user.id; */
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";
    const dataType = await DataType.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!dataType) {
      return NextResponse.json(
        { error: "Tipo de dado não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir tipo de dado:", error);
    return NextResponse.json(
      { error: "Erro ao excluir tipo de dado" },
      { status: 500 }
    );
  }
}
