import { defineConfig } from "apibara/config";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  runtimeConfig: {
    attensyscourse: {
      startingBlock: 755193,
      streamUrl: "https://sepolia.starknet.a5a.ch",
      postgresConnectionString: process.env.DATABASE_URL,
      attensysCourseAddress:
        "0x05390dc11f780b241418e875095cca768ded2a9c1b605af036bf2760bd5bf6ef",
    },
  },
});
