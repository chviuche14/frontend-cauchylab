import { Routes, Route } from 'react-router-dom';
import Inicio from './paginas/Inicio';
import Registro from './paginas/Registro';
import InicioSesion from './paginas/InicioSesion.jsx';
import PanelPrincipal from "./paginas/PanelPrincipal.jsx";
import PanelPrincipalAdmin from "./paginas/PanelPrincipalAdmin.jsx";
import JuegoModulo from './paginas/JuegoModulo.jsx';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<InicioSesion />} />
            <Route path="/panel" element={<PanelPrincipal />} />
            <Route path="/admin" element={<PanelPrincipalAdmin />} />
            <Route path="/juego/:moduloId" element={<JuegoModulo />} />
        </Routes>
    )
}

export default App;
