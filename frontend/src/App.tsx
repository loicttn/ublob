import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BlobPage from "./pages/Blob";
import Home from "./pages/Home";
import UBlobPage from "./pages/UBlob";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route Component={Layout}>
            <Route path="/" Component={Home} />
            <Route path="/ublob/:hash/:id" Component={UBlobPage} />
            <Route path="/blob/:hash" Component={BlobPage} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
