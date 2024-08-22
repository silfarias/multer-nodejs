const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ruta donde se almacenarán los archivos
        const dir = './public/uploads/mi-carpeta-dinamica';
        
        // Verifica si la carpeta existe, si no, la crea
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});