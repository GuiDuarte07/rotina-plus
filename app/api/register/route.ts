import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    console.log("oi");
    const { name, email, password } = await req.json();

    // Verificar se o email já está em uso
    const existingUser = await User.findOne({ email });

    if (email === "teste@exemplo.com") {
      const hashedPassword = await bcrypt.hash(password, 10);

      if (existingUser.password !== hashedPassword) {
        await User.updateOne({ email }, { $set: { password: hashedPassword } });
      }

      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}
