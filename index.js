import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'node:fs'
import { Files } from "./src/models/Files.js";
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { connectDB } from './src/db/connectDB.js'
import { configEnv } from './src/config/configEnv.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false })) // para interpretar URL encoded data (opcional)

app.use(express.static(path.join(__dirname, 'public')))


const port = configEnv.PORT


const storage = multer.diskStorage({ // medio de almacenamiento
    destination: './public/uploads',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // usamos file
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // añadimos un sufijo unico al nombre del archivo para no pisar otros
    }
})

// filtramos formatos de archivos permitidos
const fileFilter = (res, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc|doxc|txt/; // extensiones permitidas
    const mimeType = fileTypes.test(file.mimetype);
    const exName = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && exName) {
        return cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado'), false);
    }
}

const upload = multer({
    storage,
    fileFilter
})

// subir archivo
// con el metodo single subimos 1 archivo, con array subimos varios
app.post('/upload-file', upload.single('file'), async (req, res) => { 
    try {
        const { originalname, mimetype, path: filePath } = req.file;

        // Guarda la información del archivo en la base de datos
        await Files.create({
            name: originalname,
            type: mimetype,
            path: filePath,
        });
        return res.json({ message: 'Archivo Subido correctamente'}) // el archivo se almacena en req.file
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
})


app.post('/uploads-files', upload.array('files'), async (req, res) => {
    try {
        const filesEntries = []
        for (const file of req.files) {
            const newFile = await Files.create({
                name: file.originalname,
                type: file.mimetype.startsWith('image') ? 'image' : 'file',
                path: file.path,
                size: file.size
            })
            filesEntries.push(newFile)
        }
        res.json({ message: 'Archivos subidos correctamente', files: filesEntries })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al subir archivos' })
        throw new Error(error)
    }
})


// crear directorio
app.post('/create-folder', async (req, res) => {
    const { folderName } = req.body; // Recogemos el nombre de la carpeta del body
    if (!folderName) {
        console.log(req.body); 
        return res.status(400).json({ message: 'El nombre de la carpeta es requerido' });
    }
    const dir = path.join(__dirname, 'public', 'uploads', folderName); // Ruta de la carpeta
    if (!fs.existsSync(dir)) { // Si la carpeta no existe en la ruta, se crea
        fs.mkdirSync(dir, { recursive: true }); // Aseguramos que se creen directorios anidados
        // Guardar la carpeta en la base de datos
        try {
            const newFolder = await Files.create({
                name: folderName,
                type: 'folder',
                path: dir,
                isDirectory: true
            });
            return res.json({ message: 'Carpeta creada correctamente', folder: newFolder });
        } catch (error) {
            console.error("Error al guardar en la base de datos", error);
            return res.status(500).json({ message: 'Error al guardar la carpeta en la base de datos' });
        }
    } else {
        return res.json({ message: 'La carpeta ya existe' });
    }
});


app.get('/files', async (req, res) => {
    try {
        // Obtiene todos los archivos y carpetas desde la base de datos
        const files = await Files.findAll();
        res.json(files);
    } catch (error) {
        console.error("Error al obtener los archivos desde la base de datos", error);
        res.status(500).json({ error: 'Error al obtener los archivos desde la base de datos' });
    }
});

app.use(express.static('public'));


app.listen(port, () => {
    connectDB()
    console.log(`Sever running on http://localhost:${port}`);
})