import Header from "./Header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex flex-col gap-10 mx-auto max-w-6xl px-4 pt-16 w-full">
      <Header />

      <Outlet />

      {/* <Footer /> */}
    </div>
  );
}

export default Layout;
