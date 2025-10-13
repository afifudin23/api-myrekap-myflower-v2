import { envSchema } from "@/schemas/env.schema";
import dotenv from "dotenv";

dotenv.config();
const env = envSchema.parse(process.env);
export default env;
