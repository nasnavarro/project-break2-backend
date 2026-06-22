import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI no está definido. El servidor no puede arrancar.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB conectado correctamente");
}
