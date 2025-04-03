import mongoose from "mongoose";

// Definir o tipo para o cache
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI");
}

/**
 * Global é usado aqui para manter a conexão
 * durante hot reloads em desenvolvimento
 */
const globalAny = global as any;
let cached = globalAny.mongoose as MongooseCache;

if (!cached) {
  cached = globalAny.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
