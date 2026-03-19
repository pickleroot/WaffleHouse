import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home.tsx";
import Course from "@/pages/Course.tsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<Course />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;