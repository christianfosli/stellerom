interface HeaderProps {
  isSignedIn: boolean;
  userName?: string | null;
}

export default function Header({ isSignedIn, userName }: HeaderProps) {
  return (
    <header class="flex justify-between items-center">
      <a href="/">
        <img src="/logo.png" style="max-height: 5rem;" alt="Stellerom logo" />
      </a>
      {isSignedIn && (
            <span>
              <a href="/profile">👤{userName}</a>{" "}
              <a
                class="p-2 inline-block whitespace-nowrap border rounded"
                href="/auth/signout"
              >
                Logg ut
              </a>
            </span>
          ) || (
        <span>
          🫥Ikke innlogget{" "}
          <a
            class="p-2 inline-block whitespace-nowrap border rounded"
            href="/auth/signin"
          >
            Logg inn
          </a>
        </span>
      )}
    </header>
  );
}
