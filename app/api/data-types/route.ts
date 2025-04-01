import { type NextRequest, NextResponse } from "next/server";
import DataType from "@/lib/models/dataType";
import dbConnect from "@/lib/db";

/* import { getServerSession } from "next-auth/next" */
/* import { authOptions } from "@/lib/auth" */

export async function GET(req: NextRequest) {
  try {
    /* const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    } */

    const userId = "65f1a1b2c3d4e5f6a7b8c9d0"; /* session.user.id */

    await dbConnect(); // Conecta ao MongoDB

    const dataTypes = await DataType.find({
      userId,
    });
    return NextResponse.json(dataTypes, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar tipos de dados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipos de dados" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    /* const session = await getServerSession(authOptions); */

    /* if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    } */

    await dbConnect();

    const body = await req.json();
    /* const userId = session.user.id; */
    const userId = "65f1a1b2c3d4e5f6a7b8c9d0";

    const dataType = new DataType({
      ...body,
      userId,
    });

    await dataType.save();

    return NextResponse.json(dataType, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar tipo de dado:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Já existe um tipo de dado com este nome" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar tipo de dado" },
      { status: 500 }
    );
  }
}
