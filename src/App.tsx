import { Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { ForestAtmosphere } from './components/ForestAtmosphere';
import { ForestHome } from './pages/ForestHome';
import { UpscalerPage } from './pages/UpscalerPage';

function App() {
  return (
    <div className="relative min-h-screen">
      <ForestAtmosphere />
      <NavBar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<ForestHome />} />
          <Route path="/upscaler" element={<UpscalerPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
