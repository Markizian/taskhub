import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json({ message: "User already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashed });

    return NextResponse.json({ message: "User created", user: newUser }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}