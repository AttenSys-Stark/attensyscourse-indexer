import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";
import { drizzleStorage } from "@apibara/plugin-drizzle";
import { drizzle } from "@apibara/plugin-drizzle";
import { StarknetStream } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import * as schema from "../lib/schema";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl } = runtimeConfig["attensyscourse"];
  const db = drizzle({
    schema,
  });

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
     events: [
        {
          address:
            "0x05390dc11f780b241418e875095cca768ded2a9c1b605af036bf2760bd5bf6ef",
        },
      ],
    },
    plugins: [
      drizzleStorage({ db, migrate: { migrationsFolder: "./drizzle" } }),
    ],
    async transform({ endCursor, finality, block }) {
      const logger = useLogger();

      logger.info(
        "Transforming block | orderKey: ",
        endCursor?.orderKey,
        " | finality: ",
        finality,
      );
      const { events, header } = block;
      logger.log(`Block number ${header?.blockNumber}`);
      for (const event of events) {
        logger.log(`Event ${event.eventIndex} tx=${event.transactionHash}`);
      }
      // Example snippet to insert data into db using drizzle with postgres
      // const { db: database } = useDrizzleStorage();

      // await database.insert(schema.cursorTable).values({
      //   endCursor: Number(endCursor?.orderKey),
      //   uniqueKey: `${endCursor?.uniqueKey}`,
      // });
    },
  });
}
