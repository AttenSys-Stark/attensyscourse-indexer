import { defineConfig } from "apibara/config";

export default defineConfig({
  runtimeConfig: {
    attensyscourse: {
      startingBlock: 755193,
      streamUrl: "https://sepolia.starknet.a5a.ch",
      postgresConnectionString:
        process.env.POSTGRES_CONNECTION_STRING ?? "memory://attensyscourse",
      attensysCourseAddress:
        "0x05390dc11f780b241418e875095cca768ded2a9c1b605af036bf2760bd5bf6ef",
    },
  },
});
