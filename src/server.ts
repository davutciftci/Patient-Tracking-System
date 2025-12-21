import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router/routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router);

const PORT = process.env.PORT || 3005;

console.log("Sunucu başlatılıyor...");

const server = app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

server.on('error', (err) => {
    console.error('Sunucu hatası:', err);
});