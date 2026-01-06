
import { prisma } from './lib/prisma.ts'

async function main() {
  try {
    console.log("Attempting to connect to DB...");
    const userCount = await prisma.user.count();
    console.log("Connection successful. User count:", userCount);

    console.log("Attempting to fetch movies with orderBy...");
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log("Fetch successful. Movies found:", movies.length);
    console.log("First movie:", movies[0]);

  } catch (e) {
    console.log("Full error details:");
    console.error(e);
  }
}

main();
