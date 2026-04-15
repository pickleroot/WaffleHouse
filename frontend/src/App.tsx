import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home.tsx";
import Course from "@/pages/Course.tsx";
import Auth from "@/pages/Auth.tsx";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<Course />} />
                <Route path="/auth" element={<Auth/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;