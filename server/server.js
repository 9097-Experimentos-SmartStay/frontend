const jsonServer = require("json-server");
const cors = require("cors");
const server = jsonServer.create();
const router = jsonServer.router("db.json"); // Tu "arma" (la base de datos)
const middlewares = jsonServer.defaults();

// "Táctica" de Permisos (CORS)
// Deja que tu "estadio" (Firebase) hable con tu "campo de juego" (Render)
const corsOptions = {
    origin: "https://smartstay-3cffc.web.app" // Tu "pase VIP"
};
server.use(cors(corsOptions));
server.use(middlewares);

// "Táctica" de Reescritura (opcional pero buena)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
}));

server.use(router);

// "Táctica" de Render: Escucha en el "campo" (puerto) que Render te da
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`JSON Server está "marcando goles" en el puerto ${port}`);
});
