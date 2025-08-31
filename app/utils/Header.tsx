interface HeaderProps {
  isSignedIn: boolean;
  userName?: string;
}

export default function Header({ isSignedIn, userName }: HeaderProps) {
  return (
    <header class="flex justify-between items-center">
      <a href="/">
        <h1 class="text-xl font-light">Stellerom.no</h1>
      </a>
      {isSignedIn && (
            <span>
              <a href="/profile">👤{userName}</a>{" "}
              <a class="p-2 border rounded" href="/auth/signout">Logg ut</a>
            </span>
          ) || (
        <span>
          🫥Ikke innlogget{" "}
          <a class="p-2 border rounded" href="/auth/signin">Logg inn</a>
        </span>
      )}
    </header>
  );
}
