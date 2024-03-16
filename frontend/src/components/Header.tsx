import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="w-full">
      <Link to="/">
        <h1 className="text-4xl">
          <span className="text-light-purple">&micro;</span>
          <span className="text-white">Blob</span>
        </h1>
      </Link>
    </header>
  );
}

export default Header;
