import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import GuessingGame from "lib/guessingGame";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>{"Who's that Pokemon?"}</title>
        <link rel="icon" href="/img/poke-ball.png" />
        <meta name="description" content="Pokemon guessing game." />
      </Head>

      <main className="flex flex-col items-center gap-1">
        <GuessingGame />
      </main>

      <footer className="flex justify-center items-center gap-4 py-4">
        <Link href="/results">
          <a className="border border-slate-500 px-2 py-1">View Results</a>
        </Link>
        <a
          href="https://github.com/coalman/whos-that-pokemon"
          aria-label="Github repository link."
          className="border border-slate-500 px-2 py-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <use href="/img/github.svg#icon" />
          </svg>
        </a>
      </footer>
    </div>
  );
};

export default Home;
