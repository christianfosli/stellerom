/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";

export default function Header() {
  return (
    <header>
      <a href="/">
        <h1 class={tw`text-xl font-light`}>Stellerom.no</h1>
      </a>
    </header>
  );
}
